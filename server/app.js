const express = require('express');
const cors = require('cors');
const path = require('path');
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

const allowedOrigins = [
  'https://employe-movement-management-system.vercel.app',
  'https://employe-movement-management-system-sigma.vercel.app',
  'https://employe-movement-management-system-using.onrender.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

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

module.exports = app;