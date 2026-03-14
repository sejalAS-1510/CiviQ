# CiviQ - Community Issue Management System

A modern web application for managing community complaints and issues, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Quick Start (One Command)

```bash
npm run dev
```

This automatically starts both frontend and backend servers!

## 📋 Manual Setup (Alternative)

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
python -m http.server 5501
```

## 🔑 Test Account

- **Email:** test@example.com
- **Password:** password123

## 🌐 URLs

- **Frontend:** http://localhost:5501
- **Backend:** http://localhost:5000

3. **Environment Configuration**
   - Copy `.env` file and update the values:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running locally or update MONGO_URI for cloud instance

5. **Run the Backend**

   ```bash
   npm start
   ```

   Server will start on http://localhost:5000

6. **Frontend Setup**
   - Open `frontend/pages/index.html` in your browser
   - Or serve the frontend files using a local server

## API Endpoints

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Complaints

- `GET /api/complaints` - Get all complaints (filtered by role)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get single complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint (admin only)
- `PUT /api/complaints/:id/assign` - Assign technician (admin only)

### User Management (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## User Roles

1. **Resident/User**
   - Submit complaints
   - View their own complaints
   - Update complaint details
   - Track complaint status

2. **Technician**
   - View assigned complaints
   - Update complaint status
   - Access complaints in their specialization area

3. **Administrator**
   - Full system access
   - Manage users and complaints
   - View analytics and reports
   - Assign technicians to complaints

## Project Structure

```
CiviQ/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── userController.js     # User authentication & management
│   │   └── complaintController.js # Complaint CRUD operations
│   ├── middleware/
│   │   └── authMiddleware.js     # Authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Complaint.js         # Complaint schema
│   ├── routes/
│   │   ├── userRoutes.js        # User API routes
│   │   └── complaintRoutes.js   # Complaint API routes
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .env                     # Environment variables
├── frontend/
│   ├── pages/
│   │   └── index.html           # Main application page
│   ├── js/
│   │   └── main.js              # Frontend JavaScript
│   └── css/
│       └── style.css            # Application styles
└── README.md
```

## Development

### Running in Development Mode

```bash
# Backend
cd backend
npm run dev  # If you add nodemon to dev script

# Frontend
# Open index.html in browser or use a local server
# Example with Python: python -m http.server 8000
```

### Testing the API

Use tools like Postman or Insomnia to test API endpoints. Include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.
