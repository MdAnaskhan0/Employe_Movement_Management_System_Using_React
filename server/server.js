const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const port = 5137;
const db = mysql.createConnection({
  host: 'localhost',
  user: "root",
  password: "",
  database: "employee_movement"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});


// Create a new user
// app.post('/users', (req, res)=>{

//   sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
//   db.query(sql, [req.body.username, req.body.email, req.body.password], (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send({ status: 'error', message: 'Error creating user' });
//     } else {
//       res.send({ status: 'ok', message: 'User created successfully' });
//     }
//   });
// })

app.post('/users', (req, res) => {
  const { username, email, password } = req.body;

  // First, check if the username already exists
  const checkSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkSql, [username], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send({ status: 'error', message: 'Database error during username check' });
    }

    if (checkResult.length > 0) {
      // Username already exists
      return res.status(400).send({ status: 'error', message: 'Username already exists' });
    }

    // If not exists, proceed to insert
    const insertSql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(insertSql, [username, email, password], (insertErr, insertResult) => {
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
        username: result[0].username,
        email: result[0].email,
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

  const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime format

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

// Get all movement data for a user
app.get('/movementdata/:userID', (req, res) => {
  const { userID } = req.params;
  // console.log(`Fetching data for userID: ${userID}`); // Log the received userID
  
  const sql = 'SELECT * FROM movementdata WHERE userID = ?';
  db.query(sql, [userID], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send({ status: 'error', message: 'Error getting movement data' });
    }
    console.log('Query result:', result);
    res.send(result);
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
