const { Client } = require("pg");
const AWS = require("aws-sdk");
const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");

exports.handler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const result = await client.query(`
      SELECT service_number, month, year, total_cost, pf_penalty
      FROM bills
      WHERE bill_date >= NOW() - interval '30 days'
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Monthly Summary");
    sheet.columns = [
      { header: "Service Number", key: "service_number", width: 20 },
      { header: "Month", key: "month", width: 10 },
      { header: "Year", key: "year", width: 10 },
      { header: "Total Cost", key: "total_cost", width: 15 },
      { header: "PF Penalty", key: "pf_penalty", width: 15 }
    ];
    result.rows.forEach(row => sheet.addRow(row));
    const buffer = await workbook.xlsx.writeBuffer();

    const s3 = new AWS.S3({ region: process.env.AWS_REGION });
    const key = `reports/summary-${uuidv4()}.xlsx`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }).promise();

    const fileUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const ses = new AWS.SES({ region: process.env.AWS_REGION });
    await ses.sendEmail({
      Source: process.env.SES_FROM,
      Destination: { ToAddresses: ["admin@hap-eb.local"] },
      Message: {
        Subject: { Data: "HAP-EB Weekly Report" },
        Body: { Html: { Data: `<p>Your weekly report is ready:</p><a href="${fileUrl}">Download Report</a>` } }
      }
    }).promise();

    return { statusCode: 200, body: JSON.stringify({ success: true, reportUrl: fileUrl }) };
  } catch (err) {
    console.error("Report generation failed:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.end();
  }
};
