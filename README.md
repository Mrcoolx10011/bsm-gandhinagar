# BSM Gandhinagar - NGO Management Platform

A comprehensive NGO website and admin panel built with React, TypeScript, Node.js, and MongoDB. This platform provides a complete solution for managing NGO operations including member management, event organization, donation tracking, and inquiry handling.

## 🌟 Features

### Public Website
- **Responsive Landing Page**: Hero slider, mission section, statistics, featured events, testimonials
- **Members Directory**: Location-based tree view with WhatsApp integration
- **Events Management**: Filterable events with registration capabilities
- **Donation System**: Multiple payment methods with campaign tracking
- **Contact System**: Contact form with inquiry management

### Admin Panel
- **Dashboard**: Overview with key metrics and recent activities
- **Members Management**: CRUD operations for organization members
- **Events Management**: Create and manage events with attendee tracking
- **Donations Management**: Track donations and generate reports
- **Inquiries Management**: Handle contact form submissions with response system
- **Settings**: Admin profile and system configuration

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Zustand** for state management
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose (via connection string)
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Express Validator** for input validation

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas account** (or local MongoDB instance)
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/bsm-website.git
   cd bsm-website
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers (API server and Vite)
   ```bash
   # Option 1: Start both servers with one command
   npm run dev:all
   
   # Option 2: Start servers separately in different terminals
   # Terminal 1 - Start API server first:
   npm run dev:api
   
   # Terminal 2 - Then start Vite server:
   npm run dev:vite
   ```

5. Open your browser and navigate to `http://localhost:5173`

> **Important**: Always start the API server (port 3000) before the Vite server (port 5173). See `DEVELOPMENT_WORKFLOW.md` for detailed instructions and troubleshooting.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bsm-gandhinagar
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="mongodb+srv://mrcoolx:root@123@cluster0.ubpz2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# JWT Secret (Change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Credentials (Default login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@bsmgandhinagar.org
```

### 4. Database Setup

The application uses MongoDB with a simple connection string. No additional setup is required as the database will be created automatically when the application starts.

### 5. Start the Application

```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

### Alternative: Start Services Separately

```bash
# Terminal 1 - Start backend server
npm run server

# Terminal 2 - Start frontend client
npm run client
```

## 🔐 Default Admin Access

- **URL**: http://localhost:5173/admin/login
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
bsm-gandhinagar/
├── public/                     # Static assets
│   └── bsm-logo.png           # Organization logo
├── src/                       # Frontend source code
│   ├── components/            # React components
│   │   ├── admin/            # Admin panel components
│   │   ├── auth/             # Authentication components
│   │   ├── home/             # Homepage components
│   │   └── layout/           # Layout components
│   ├── pages/                # Page components
│   │   ├── admin/            # Admin pages
│   │   └── public/           # Public pages
│   ├── store/                # Zustand state management
│   ├── utils/                # Utility functions
│   └── App.tsx               # Main app component
├── server/                   # Backend source code
│   ├── api/                  # API routes
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   └── index.js              # Server entry point
├── lib/                      # Shared libraries
└── package.json              # Dependencies and scripts
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Admin logout

### Members Management
- `GET /api/members` - Get all members
- `POST /api/members` - Create new member (Admin only)
- `PUT /api/members/:id` - Update member (Admin only)
- `DELETE /api/members/:id` - Delete member (Admin only)
- `GET /api/members/location/tree` - Get members grouped by location

### Events Management
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `POST /api/events/:id/register` - Register for event

### Donations Management
- `GET /api/donations` - Get all donations (Admin only)
- `POST /api/donations` - Create new donation
- `GET /api/donations/stats` - Get donation statistics (Admin only)
- `PUT /api/donations/:id` - Update donation status (Admin only)

### Inquiries Management
- `GET /api/inquiries` - Get all inquiries (Admin only)
- `POST /api/inquiries` - Create new inquiry
- `PUT /api/inquiries/:id` - Update inquiry (Admin only)
- `DELETE /api/inquiries/:id` - Delete inquiry (Admin only)

### Statistics
- `GET /api/stats` - Get dashboard statistics
- `GET /api/stats/activities` - Get recent activities

## 🗄 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // hashed with bcrypt
  role: String, // 'ADMIN', 'MEMBER'
  createdAt: Date,
  updatedAt: Date
}
```

### Members Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  role: String,
  state: String,
  city: String,
  bio: String,
  image: String,
  status: String, // 'ACTIVE', 'INACTIVE'
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  category: String,
  image: String,
  maxAttendees: Number,
  status: String, // 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'
  attendees: [{
    name: String,
    email: String,
    phone: String,
    registeredAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Donations Collection
```javascript
{
  _id: ObjectId,
  donorName: String,
  email: String,
  phone: String,
  amount: Number,
  campaign: String,
  method: String, // 'CARD', 'UPI', 'QR', 'BANK'
  transactionId: String,
  status: String, // 'PENDING', 'COMPLETED', 'FAILED'
  isAnonymous: Boolean,
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Inquiries Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  status: String, // 'NEW', 'REPLIED', 'ARCHIVED'
  priority: String, // 'LOW', 'MEDIUM', 'HIGH'
  response: String,
  respondedAt: Date,
  respondedById: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run client       # Start frontend only
npm run server       # Start backend only

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🌍 Frontend Routes

### Public Routes
- `/` - Homepage
- `/members` - Members directory
- `/events` - Events listing
- `/donations` - Donation page
- `/contact` - Contact form

### Admin Routes (Protected)
- `/admin/login` - Admin login
- `/admin` - Dashboard
- `/admin/members` - Members management
- `/admin/events` - Events management
- `/admin/donations` - Donations management
- `/admin/inquiries` - Inquiries management
- `/admin/settings` - Admin settings

## 🔒 Authentication & Security

- **JWT-based authentication** for admin access
- **Password hashing** using bcryptjs
- **Protected routes** with authentication middleware
- **Input validation** using express-validator
- **CORS configuration** for secure API access
- **Environment variables** for sensitive data

## 📱 Features Overview

### Member Management
- Add, edit, delete members
- Location-based organization (State > City)
- Contact integration (Phone, WhatsApp)
- Status tracking (Active/Inactive)
- Search and filter capabilities

### Event Management
- Create and manage events
- Attendee registration system
- Capacity management
- Category-based organization
- Image gallery support
- Status tracking (Upcoming, Ongoing, Completed, Cancelled)

### Donation System
- Multiple payment methods
- Campaign-based donations
- Anonymous donation option
- Transaction tracking
- Donation statistics and reporting
- QR code payment support

### Inquiry Management
- Contact form submissions
- Priority levels (Low, Medium, High)
- Status tracking (New, Replied, Archived)
- Response system
- Admin assignment

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Backend Deployment (Railway/Heroku)
1. Set environment variables
2. Deploy the server code
3. Ensure MongoDB connection string is configured

### Environment Variables for Production
```env
DATABASE_URL=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
PORT=3001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📞 Support

For support and questions:
- Email: support@bsmgandhinagar.org
- Create an issue in the repository

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a demo application. For production use, ensure to:
- Change default admin credentials
- Use secure JWT secrets
- Implement proper SSL/TLS
- Set up proper backup systems
- Configure monitoring and logging
- Implement rate limiting
- Add comprehensive error handling