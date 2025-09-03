// HAP-EB Automated Reports Function
// Netlify Function for generating and sending billing reports

const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Starting report generation...');
    
    // Environment variables
    const {
      DATABASE_URL,
      AWS_REGION = 'us-east-1',
      S3_BUCKET,
      SES_FROM,
      ADMIN_EMAIL = 'admin@hap-eb.local',
      REPORT_DAYS = '30'
    } = process.env;

    // Validate required environment variables
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(REPORT_DAYS));

    console.log(`Generating report from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Connect to database
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    await client.connect();
    console.log('Database connected successfully');

    // Query billing data
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
      WHERE bill_date >= $1 AND bill_date <= $2
      ORDER BY bill_date DESC, service_number ASC
    `;

    const result = await client.query(query, [startDate.toISOString(), endDate.toISOString()]);
    const billsData = result.rows;

    console.log(`Found ${billsData.length} billing records`);

    await client.end();

    // Calculate summary statistics
    const summary = {
      totalRecords: billsData.length,
      totalCost: billsData.reduce((sum, bill) => sum + parseFloat(bill.total_cost || 0), 0),
      totalPenalties: billsData.reduce((sum, bill) => sum + parseFloat(bill.pf_penalty || 0), 0),
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      uniqueServices: [...new Set(billsData.map(bill => bill.service_number))].length
    };

    // For now, return success with data summary
    // In a full implementation, you would:
    // 1. Generate Excel file using ExcelJS
    // 2. Upload to S3
    // 3. Send email via SES
    
    const response = {
      success: true,
      message: 'Report generated successfully',
      summary,
      timestamp: new Date().toISOString(),
      reportId: `report_${Date.now()}`
    };

    console.log('Report generation completed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Report generation failed:', error);

    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(errorResponse)
    };
  }
};
