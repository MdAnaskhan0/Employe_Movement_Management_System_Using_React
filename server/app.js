const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileImageRoutes = require('./routes/profileImageRoutes');
const userAssignmentRoutes = require('./routes/userAssignmentRoutes');
const userActivityRoutes = require('./routes/userActivityRoutes');
const movementRoutes = require('./routes/movementRoutes');
const movementLogRoutes = require('./routes/movementLogRoutes');
const companyRoutes = require('./routes/companyRoutes');
const partyRoutes = require('./routes/partyRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const branchRoutes = require('./routes/branchRoutes');
const designationRoutes = require('./routes/designationRoutes');
const visitingStatusRoutes = require('./routes/visitingStatusRoutes');
const roleRoutes = require('./routes/roleRoutes');
const teamRoutes = require('./routes/teamRoutes');
const permissionRoutes = require('./routes/permissionRoutes');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: [
    // 'http://localhost:5173',
    // 'http://localhost:5174',
    // 'http://192.168.0.103:5173',
    // 'http://192.168.0.103:5174',
    // 'http://192.168.111.140:5173',
    // 'http://192.168.111.140:5174',
    'employe-movement-management-system.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/profile-image', profileImageRoutes);
app.use('/unassigned', userAssignmentRoutes);
app.use('/user-activities', userActivityRoutes);
app.use('/movements', movementRoutes);
app.use('/movement-logs', movementLogRoutes);
app.use('/companynames', companyRoutes);
app.use('/partynames', partyRoutes);
app.use('/departments', departmentRoutes);
app.use('/branchnames', branchRoutes);
app.use('/designations', designationRoutes);
app.use('/visitingstatus', visitingStatusRoutes);
app.use('/roles', roleRoutes);
app.use('/teams', teamRoutes);
app.use('/permissions', permissionRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ status: 'error', message: 'Something broke!' });
});

module.exports = app;