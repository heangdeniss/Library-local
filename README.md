# 📚 AMS Library Management System

A modern, full-featured digital library management system built with Node.js, Express, and PostgreSQL. This comprehensive platform allows users to browse, borrow, and read digital books while providing administrators with powerful management tools.

![Library Management System](public/images/Library%20AMS.png)

## 🌟 Features

### 📖 For Users
- **User Authentication**: Secure registration and login system
- **Digital Book Browsing**: Browse books by categories with advanced filtering
- **Book Borrowing System**: Borrow and return books with automatic due date tracking
- **PDF Reading**: Full PDF viewer for borrowed books with preview mode for non-borrowed books
- **Personal Dashboard**: Track borrowed books, borrowing history, and due dates
- **Contact System**: Submit inquiries and messages to library administrators
- **Responsive Design**: Modern, mobile-friendly interface with Bootstrap 5

### 🔧 For Administrators
- **Admin Dashboard**: Comprehensive overview of library statistics and recent activity
- **Book Management**: Upload, categorize, and manage PDF books
- **User Management**: View and manage user accounts
- **Borrowing Management**: Monitor all borrowing records and overdue books
- **Contact Message Management**: Handle user inquiries with status tracking
- **Settings Configuration**: Customize borrowing policies and fine structures
- **Analytics**: View detailed statistics on books, users, and borrowing patterns

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Frontend**: EJS templating with Bootstrap 5
- **Authentication**: bcrypt for password hashing, express-session for session management
- **File Upload**: multer for PDF file handling
- **PDF Viewing**: Custom PDF.js integration

### Key Categories
- 📊 Analysis & Statistics
- 🗄️ Big Data
- 🤖 Machine Learning & AI
- 📈 Data Visualization
- 🧠 Deep Learning & Neural Networks
- 🔧 Data Engineering & Databases

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ams-library-management.git
   cd ams-library-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb Library
   
   # Run database setup script
   psql -d Library -f database_setup.sql
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Library
   DB_USER=your_username
   DB_PASSWORD=your_password
   SESSION_SECRET=your_session_secret_here
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Access the application**
   - User Interface: `http://localhost:3000`
   - Admin Interface: `http://localhost:3000/admin`

## 📁 Project Structure

```
├── 📄 index.js                 # Main application server
├── 📄 package.json            # Dependencies and scripts
├── 📄 database_setup.sql      # Database schema and initial data
├── 📁 public/                 # Static assets
│   ├── 📁 images/             # Image files
│   ├── 📁 js/                 # Client-side JavaScript
│   ├── 📁 styles/             # CSS stylesheets
│   └── 📁 uploads/            # Uploaded PDF files
├── 📁 views/                  # EJS templates
│   ├── 📁 partials/           # Reusable template components
│   ├── 📄 index.ejs           # Homepage for guests
│   ├── 📄 index1.ejs          # Homepage for logged-in users
│   ├── 📄 admin-dashboard.ejs # Admin control panel
│   └── 📄 ...                 # Other page templates
└── 📁 scripts/               # Database migration and utility scripts
```

## 🗄️ Database Schema

### Core Tables
- **users**: User account information
- **admin**: Administrator accounts
- **books**: Book metadata and file information
- **borrowing_records**: Book borrowing transactions
- **borrowing_settings**: Configurable borrowing policies
- **contact_messages**: User inquiries and support messages

### Key Relationships
- Users can borrow multiple books
- Books can be borrowed by multiple users over time
- Admins can manage books and respond to contact messages
- Borrowing settings control global library policies

## 🔐 Authentication & Authorization

### User Levels
1. **Guest Users**: Can browse book catalog, register, and contact support
2. **Registered Users**: Can borrow books, access PDF viewer, and manage personal library
3. **Administrators**: Full system access including user management and system configuration

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- CSRF protection
- Input validation and sanitization

## 📊 Key Features Deep Dive

### Borrowing System
- **Configurable Policies**: Set borrowing duration, maximum books per user, and fine rates
- **Automatic Due Dates**: Calculate return dates based on borrowing settings
- **Fine Calculation**: Automatic fine calculation for overdue books
- **Borrowing History**: Complete audit trail of all borrowing activities

### Contact Management
- **Smart Status Tracking**: Automatic status updates when admins add notes
- **Multi-status Workflow**: Unread → Read → Replied → Resolved
- **Admin Notes**: Internal notes for tracking communication
- **Quick Actions**: Fast status updates with one-click buttons

### PDF Management
- **Secure File Storage**: Organized file structure with validation
- **Preview Mode**: Limited access for non-borrowed books
- **Full Access**: Complete PDF viewing for borrowed books
- **Multiple Formats**: Support for various PDF types and sizes

## 🔧 Configuration

### Borrowing Settings
- **Default Borrow Days**: How long users can keep books (default: 14 days)
- **Max Books Per User**: Borrowing limit per user (default: 5 books)
- **Fine Per Day**: Daily fine for overdue books (default: $0.50)
- **Renewal Limit**: Maximum renewals allowed (default: 2)

### Categories
Books are organized into predefined categories that can be customized:
- Analysis & Statistics
- Big Data
- Machine Learning & AI
- Data Visualization
- Deep Learning & Neural Networks
- Data Engineering & Databases

## 🚀 Deployment

### Production Considerations
1. **Environment Variables**: Set all required environment variables
2. **Database Optimization**: Configure PostgreSQL for production workload
3. **File Storage**: Consider cloud storage for PDF files in production
4. **SSL/HTTPS**: Enable HTTPS for secure authentication
5. **Process Management**: Use PM2 or similar for process management
6. **Backup Strategy**: Implement regular database and file backups

### Docker Deployment (Optional)
```dockerfile
# Example Dockerfile structure
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 API Endpoints

### User Endpoints
- `GET /` - Homepage
- `POST /register` - User registration
- `POST /login` - User login
- `GET /books` - Browse books
- `POST /borrowing/borrow/:bookId` - Borrow a book
- `POST /borrowing/return/:recordId` - Return a book

### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard
- `POST /admin/upload-pdf` - Upload new book
- `GET /admin/contact-messages` - View contact messages
- `POST /admin/contact-messages/:id/status` - Update message status
- `GET /admin/borrowing/settings` - Borrowing configuration
iction
## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check PostgreSQL service and connection parameters
2. **File Upload Issues**: Verify upload directory permissions
3. **PDF Viewing Problems**: Check file paths and PDF.js configuration
4. **Session Issues**: Verify session secret and storage configuration

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**AMS Library Team**
- Email: heangdenis011468@gmail.com or e20220527@dtc1.itc.edu.kh
- Institution: Institute of Technology of Cambodia

## 🙏 Acknowledgments

- Bootstrap team for the amazing CSS framework
- PDF.js team for the PDF viewing capabilities
- PostgreSQL community for the robust database system
- Express.js team for the excellent web framework

## 📊 Stats

![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/ams-library-management)
![GitHub stars](https://img.shields.io/github/stars/yourusername/ams-library-management)
![GitHub forks](https://img.shields.io/github/forks/yourusername/ams-library-management)
![GitHub issues](https://img.shields.io/github/issues/yourusername/ams-library-management)

---

⭐ If you found this project helpful, please give it a star!
