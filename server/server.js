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
app.post('/users', (req, res)=>{

  sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [req.body.username, req.body.email, req.body.password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ status: 'error', message: 'Error creating user' });
    } else {
      res.send({ status: 'ok', message: 'User created successfully' });
    }
  });
})

// Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send({ status: 'error', message: 'Error logging in' });
    } else if (result.length > 0) {
      res.send({ status: 'ok', message: 'Login successful' });
    } else {
      res.status(401).send({ status: 'error', message: 'Invalid credentials' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
