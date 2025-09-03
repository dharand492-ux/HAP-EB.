import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/reports_cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Report generated:', result)
        // Update reports list or show success message
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏢 HAP-EB Application</h1>
        <p>Automated Billing Reports & Management System</p>
      </header>
      
      <main className="main-content">
        <div className="dashboard">
          <div className="card">
            <h2>📊 Reports Dashboard</h2>
            <p>Generate and manage automated billing reports</p>
            
            <div className="actions">
              <button 
                onClick={generateReport}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '⏳ Generating...' : '📈 Generate Report'}
              </button>
            </div>
          </div>
          
          <div className="card">
            <h2>⚙️ System Status</h2>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-indicator green"></span>
                <span>Database Connected</span>
              </div>
              <div className="status-item">
                <span className="status-indicator green"></span>
                <span>AWS Services Active</span>
              </div>
              <div className="status-item">
                <span className="status-indicator green"></span>
                <span>Email Service Ready</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2>📋 Recent Reports</h2>
            <div className="reports-list">
              {reports.length === 0 ? (
                <p className="no-reports">No reports generated yet</p>
              ) : (
                reports.map((report, index) => (
                  <div key={index} className="report-item">
                    <span>{report.name}</span>
                    <span>{report.date}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>Built with ❤️ by the HAP-EB Team | Version 1.2.0</p>
      </footer>
    </div>
  )
}

export default App
