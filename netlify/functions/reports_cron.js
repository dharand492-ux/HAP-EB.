const { Client } = require("pg");
const AWS = require("aws-sdk");
const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");

// Configuration with validation
const config = {
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 1
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.S3_BUCKET,
    sesFrom: process.env.SES_FROM
  },
  report: {
    recipientEmail: process.env.ADMIN_EMAIL || 'admin@hap-eb.local',
    dayRange: parseInt(process.env.REPORT_DAYS) || 30
  }
};

// Validate required environment variables
function validateConfig() {
  const required = ['DATABASE_URL', 'S3_BUCKET', 'SES_FROM'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Enhanced database query with better error handling
async function fetchReportData(client, dayRange) {
  const query = `
    SELECT 
      service_number,
      month,
      year,
      total_cost,
      pf_penalty,
      bill_date,
      created_at
    FROM bills 
    WHERE bill_date >= CURRENT_DATE - INTERVAL '${dayRange} days'
    ORDER BY bill_date DESC, service_number ASC
  `;
  
  try {
    const result = await client.query(query);
    console.log(`Fetched ${result.rows.length} records for report`);
    return result.rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// Create enhanced Excel report with formatting
async function createExcelReport(data, dayRange) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Monthly Summary");
  
  // Set worksheet properties
  workbook.creator = 'HAP-EB System';
  workbook.created = new Date();
  
  // Define columns with enhanced formatting
  sheet.columns = [
    { header: "Service Number", key: "service_number", width: 20 },
    { header: "Month", key: "month", width: 12 },
    { header: "Year", key: "year", width: 10 },
    { header: "Total Cost", key: "total_cost", width: 15 },
    { header: "PF Penalty", key: "pf_penalty", width: 15 },
    { header: "Bill Date", key: "bill_date", width: 12 }
  ];
  
  // Style the header row
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Add data rows with formatting
  data.forEach((row, index) => {
    const excelRow = sheet.addRow({
      service_number: row.service_number,
      month: row.month,
      year: row.year,
      total_cost: parseFloat(row.total_cost) || 0,
      pf_penalty: parseFloat(row.pf_penalty) || 0,
      bill_date: row.bill_date ? new Date(row.bill_date) : null
    });
    
    // Format currency columns
    excelRow.getCell('total_cost').numFmt = '"$"#,##0.00';
    excelRow.getCell('pf_penalty').numFmt = '"$"#,##0.00';
    
    // Format date column
    if (row.bill_date) {
      excelRow.getCell('bill_date').numFmt = 'mm/dd/yyyy';
    }
  });
  
  // Add summary row
  if (data.length > 0) {
    const summaryRow = sheet.addRow({});
    summaryRow.getCell('service_number').value = 'TOTAL:';
    summaryRow.getCell('service_number').font = { bold: true };
    
    const totalCost = data.reduce((sum, row) => sum + (parseFloat(row.total_cost) || 0), 0);
    const totalPenalty = data.reduce((sum, row) => sum + (parseFloat(row.pf_penalty) || 0), 0);
    
    summaryRow.getCell('total_cost').value = totalCost;
    summaryRow.getCell('total_cost').numFmt = '"$"#,##0.00';
    summaryRow.getCell('total_cost').font = { bold: true };
    
    summaryRow.getCell('pf_penalty').value = totalPenalty;
    summaryRow.getCell('pf_penalty').numFmt = '"$"#,##0.00';
    summaryRow.getCell('pf_penalty').font = { bold: true };
  }
  
  // Add metadata sheet
  const metaSheet = workbook.addWorksheet("Report Info");
  metaSheet.addRow(['Report Generated:', new Date().toLocaleString()]);
  metaSheet.addRow(['Date Range:', `Last ${dayRange} days`]);
  metaSheet.addRow(['Total Records:', data.length]);
  
  return await workbook.xlsx.writeBuffer();
}

// Upload to S3 with proper error handling
async function uploadToS3(buffer, config) {
  const s3 = new AWS.S3({ region: config.aws.region });
  const timestamp = new Date().toISOString().split('T')[0];
  const key = `reports/hap-eb-summary-${timestamp}-${uuidv4().slice(0, 8)}.xlsx`;
  
  try {
    const params = {
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: buffer,
      ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ServerSideEncryption: 'AES256',
      Metadata: {
        'report-type': 'monthly-summary',
        'generated-by': 'hap-eb-system'
      }
    };
    
    await s3.putObject(params).promise();
    
    const fileUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
    console.log(`Report uploaded successfully: ${fileUrl}`);
    return { fileUrl, key };
    
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

// Send enhanced email notification
async function sendEmailNotification(fileUrl, recordCount, config) {
  const ses = new AWS.SES({ region: config.aws.region });
  const currentDate = new Date().toLocaleDateString();
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">HAP-EB Weekly Report - ${currentDate}</h2>
      <p>Your automated weekly report has been generated successfully.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3>Report Summary</h3>
        <ul>
          <li><strong>Records Included:</strong> ${recordCount}</li>
          <li><strong>Date Range:</strong> Last ${config.report.dayRange} days</li>
          <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${fileUrl}" 
           style="background: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          📊 Download Report
        </a>
      </div>
      
      <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
        <p>This is an automated message from the HAP-EB System.</p>
        <p>If you have any questions, please contact the system administrator.</p>
      </div>
    </div>
  `;
  
  try {
    const params = {
      Source: config.aws.sesFrom,
      Destination: { 
        ToAddresses: [config.report.recipientEmail]
      },
      Message: {
        Subject: { 
          Data: `HAP-EB Weekly Report - ${currentDate}` 
        },
        Body: { 
          Html: { Data: htmlBody },
          Text: { 
            Data: `HAP-EB Weekly Report\n\nYour report is ready with ${recordCount} records.\nDownload: ${fileUrl}` 
          }
        }
      }
    };
    
    await ses.sendEmail(params).promise();
    console.log(`Email sent successfully to ${config.report.recipientEmail}`);
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Main handler with comprehensive error handling
exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  
  const startTime = Date.now();
  let client = null;
  
  try {
    console.log('Starting report generation process...');
    
    // Validate configuration
    validateConfig();
    
    // Connect to database
    client = new Client(config.database);
    await client.connect();
    console.log('Database connected successfully');
    
    // Fetch report data
    const reportData = await fetchReportData(client, config.report.dayRange);
    
    if (reportData.length === 0) {
      console.log('No data found for the specified date range');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'No data available for report generation',
          recordCount: 0
        })
      };
    }
    
    // Create Excel report
    console.log('Creating Excel report...');
    const buffer = await createExcelReport(reportData, config.report.dayRange);
    
    // Upload to S3
    console.log('Uploading to S3...');
    const { fileUrl, key } = await uploadToS3(buffer, config);
    
    // Send email notification
    console.log('Sending email notification...');
    await sendEmailNotification(fileUrl, reportData.length, config);
    
    const executionTime = Date.now() - startTime;
    console.log(`Report generation completed successfully in ${executionTime}ms`);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Report generated and sent successfully',
        reportUrl: fileUrl,
        s3Key: key,
        recordCount: reportData.length,
        executionTime: `${executionTime}ms`
      })
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('Report generation failed:', {
      error: error.message,
      stack: error.stack,
      executionTime: `${executionTime}ms`
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString()
      })
    };
    
  } finally {
    // Always close database connection
    if (client) {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
};
