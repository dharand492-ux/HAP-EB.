# HAP-EB Application

A modern web application with automated reporting functionality for HAP-EB billing management.

## 🚀 Features

- **Automated Report Generation** - Weekly Excel reports with billing data
- **Cloud Integration** - AWS S3 storage and SES email notifications  
- **Modern Frontend** - React with Vite for fast development
- **Serverless Functions** - Netlify Functions for backend processing
- **Database Integration** - PostgreSQL for data persistence

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- PostgreSQL database
- AWS account (S3 & SES)
- Netlify account

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hap-eb-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # AWS Configuration
   AWS_REGION=us-east-1
   S3_BUCKET=your-s3-bucket-name
   SES_FROM=noreply@yourdomain.com
   
   # Application Settings
   ADMIN_EMAIL=admin@hap-eb.local
   REPORT_DAYS=30
   NODE_ENV=production
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
hap-eb-app/
├── index.html                 # Main HTML template
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── netlify.toml              # Netlify deploy settings
├── src/                      # Frontend source code
│   ├── main.jsx             # Application entry point
│   ├── App.jsx              # Main App component
│   ├── components/          # React components
│   └── assets/              # Static assets
├── netlify/
│   └── functions/
│       └── reports_cron.js  # Automated reporting function
└── public/                   # Public static files
    └── favicon.ico
```

## 🔧 Configuration

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
})
```

## 📊 Reports Function

The automated reporting system (`netlify/functions/reports_cron.js`) provides:

- **Scheduled Execution** - Runs automatically via cron
- **Data Extraction** - Pulls billing data from PostgreSQL
- **Excel Generation** - Creates formatted reports with ExcelJS
- **Cloud Storage** - Uploads reports to AWS S3
- **Email Notifications** - Sends download links via AWS SES

### Report Features:
- ✅ Professional Excel formatting
- ✅ Summary calculations and totals
- ✅ Metadata tracking
- ✅ Error handling and logging
- ✅ Configurable date ranges

## 🚀 Deployment

### Netlify Deployment

1. **Connect repository to Netlify**
   - Link your Git repository
   - Set build settings as per `netlify.toml`

2. **Configure environment variables**
   - Add all required environment variables in Netlify dashboard
   - Site Settings → Environment Variables

3. **Set up cron job**
   - Configure scheduled function execution
   - Functions → Scheduled Functions

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy using Netlify CLI
netlify deploy --prod --dir=dist
```

## 🧪 Testing

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Function Testing

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run functions locally
netlify dev

# Test specific function
netlify functions:invoke reports_cron
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AWS_REGION` | AWS region for S3/SES | `us-east-1` |
| `S3_BUCKET` | S3 bucket for report storage | `hap-eb-reports` |
| `SES_FROM` | Email address for notifications | `reports@yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Report recipient email | `admin@hap-eb.local` |
| `REPORT_DAYS` | Days to include in reports | `30` |
| `NODE_ENV` | Environment mode | `production` |

## 🗄️ Database Schema

The reports function expects a `bills` table with:

```sql
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    service_number VARCHAR(50),
    month INTEGER,
    year INTEGER,
    total_cost DECIMAL(10,2),
    pf_penalty DECIMAL(10,2),
    bill_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails - Missing package.json**
   ```bash
   # Ensure package.json is committed
   git add package.json
   git commit -m "Add package.json"
   git push origin main
   ```

2. **Function Errors - Database Connection**
   - Verify `DATABASE_URL` environment variable
   - Check database connectivity
   - Ensure SSL settings are correct

3. **Reports Not Generated**
   - Check AWS credentials and permissions
   - Verify S3 bucket exists and is accessible
   - Confirm SES email is verified

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=*
NODE_ENV=development
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

## 🔄 Version History

- **v1.0.0** - Initial release with automated reporting
- **v1.1.0** - Enhanced Excel formatting and error handling
- **v1.2.0** - Added environment configuration and improved security

---

**Built with ❤️ by the HAP-EB Team**
