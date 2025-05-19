const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 5137;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'employee_movement'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});


// Admin login
app.post('/adminlogin', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM admin WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ status: 'error', message: 'Error logging in' });
    }

    if (result.length > 0) {
      res.send({
        status: 'ok',
        message: 'Login successful',
        adminID: result[0].adminID,
        username: result[0].username,
      });
    } else {
      res.status(401).send({ status: 'error', message: 'Invalid credentials' });
    }
  });
});


// Create new User
app.post('/users', (req, res) => {
  const {
    username,
    password,
    eid,
    name,
    designation,
    department,
    company,
    phone,
    email
  } = req.body;

  // Check if username already exists
  const checkSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkSql, [username], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send({ status: 'error', message: 'Database error during username check' });
    }

    if (checkResult.length > 0) {
      return res.status(400).send({ status: 'error', message: 'Username already exists' });
    }

    // Insert the new user
    const insertSql = `
      INSERT INTO users 
      (username, password, E_ID, Name, Designation, Department, Company_name, Phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      username,
      password,
      eid,
      name,
      designation,
      department,
      company,
      phone,
      email
    ];

    db.query(insertSql, values, (insertErr, insertResult) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).send({ status: 'error', message: 'Error creating user' });
      }
      res.send({ status: 'ok', message: 'User created successfully' });
    });
  });
});



// Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ status: 'error', message: 'Error logging in' });
    }

    console.log('DB result:', result);         // <-- Add this
    console.log('result[0]:', result[0]);       // <-- And this

    if (result.length > 0) {
      res.send({
        status: 'ok',
        message: 'Login successful',
        userID: result[0].userID,
        username: result[0].username
      });
    } else {
      res.status(401).send({ status: 'error', message: 'Invalid credentials' });
    }
  });
});


// Movement data save
app.post('/movementdata', (req, res) => {
  const {
    userID,
    username,
    punchTime,
    visitingStatus,
    placeName,
    partyName,
    purpose,
    remark,
  } = req.body;

  if (!userID || !username || !punchTime || !visitingStatus) {
    return res.status(400).send({ status: 'error', message: 'Missing required fields' });
  }

  // Get local time formatted for MySQL
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const localTime = new Date(now.getTime() - offsetMs);
  const dateTime = localTime.toISOString().slice(0, 19).replace('T', ' ');

  const sql = `
    INSERT INTO movementdata 
    (userID, username, dateTime, punchTime, visitingStatus, placeName, partyName, purpose, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [userID, username, dateTime, punchTime, visitingStatus, placeName, partyName, purpose, remark],
    (err, result) => {
      if (err) {
        console.error('Insert failed:', err);
        return res.status(500).send({ status: 'error', message: 'Server error' });
      }

      res.status(200).send({ status: 'ok', message: 'Data inserted successfully' });
    }
  );
});



// // Get all movement data for a user
// app.get('/movementdata/:userID', (req, res) => {
//   const { userID } = req.params;
//   // console.log(`Fetching data for userID: ${userID}`); // Log the received userID

//   const sql = 'SELECT * FROM movementdata WHERE userID = ?';
//   db.query(sql, [userID], (err, result) => {
//     if (err) {
//       console.error('Database error:', err);
//       return res.status(500).send({ status: 'error', message: 'Error getting movement data' });
//     }
//     console.log('Query result:', result);
//     res.send(result);
//   });
// });


// Get all users
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    res.send({ status: 'ok', data: results });
  });
});

// Update user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  const sql = 'UPDATE users SET ? WHERE userID = ?';

  db.query(sql, [updatedData, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }

    res.send({ status: 'ok', message: 'User updated successfully' });
  });
});


// DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE userID = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }

    res.send({ status: 'ok', message: 'User deleted successfully' });
  });
});


// // Get a single user by ID
// app.get('/users/:id', (req, res) => {
//   const sql = 'SELECT * FROM users WHERE userID = ?';
//   db.query(sql, [req.params.id], (err, result) => {
//     if (err) return res.status(500).send({ error: err.message });
//     if (!result.length) return res.status(404).send({ message: 'User not found' });
//     res.send({ data: result[0] });
//   });
// });


// Get all movement data for a user
app.get('/movementdata/:userID', (req, res) => {
  const { userID } = req.params;
  console.log(`Fetching movement data for userID: ${userID}`);

  const sql = 'SELECT * FROM movementdata WHERE userID = ?';
  db.query(sql, [userID], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ status: 'error', message: 'Error getting movement data' });
    }
    console.log('Movement Query result:', result);
    res.send({ data: result }); // <-- FIXED: wrap in an object
  });
});

// Get a single user by ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE userID = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    if (!result.length) return res.status(404).send({ message: 'User not found' });
    res.send({ data: result[0] });
  });
});





app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
