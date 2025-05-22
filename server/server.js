const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 5137;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://192.168.111.140:5173', 'http://192.168.111.140:5173/'],
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
    res.send({ data: result });
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


/* Json Data API Started */
/************************************************************************************************/ 

// Update JSON based on file name and value
const fs = require('fs');
const baseDir = path.join(__dirname, 'JsonFile');

app.post('/update-json', (req, res) => {
  const { fileName, value } = req.body;

  if (!fileName || !value) {
    return res.status(400).json({ error: 'fileName and value are required' });
  }

  const filePath = path.join(baseDir, `${fileName}.json`);

  // If file doesn't exist, create it with empty array
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }

  // Read and parse the file
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = [];

    try {
      json = JSON.parse(data);
      if (!Array.isArray(json)) json = [];
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    // Check if value already exists (case-insensitive)
    const alreadyExists = json.some(item =>
      typeof item === 'string' ? item.toLowerCase() === value.toLowerCase() : item === value
    );

    if (alreadyExists) {
      return res.status(409).json({ message: 'Value already exists', data: json });
    }

    json.push(value);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to write file' });
      res.json({ message: 'Successfully updated', data: json });
    });
  });
});


// Get JSON file data
app.get('/get-json/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(baseDir, `${fileName}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    try {
      const jsonData = JSON.parse(data);
      res.json({ data: jsonData });
    } catch (e) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

/************************************************************************************************/
/* Json Data API Finished */

// create a new company name
// Multer setup (store image in memory, not on disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});


app.post('/companynames', upload.single('companyLogo'), (req, res) => {
  const { companyname, companyDescription } = req.body;
  const companyLogo = req.file ? req.file.buffer : null;

  if (!companyname) {
    return res.status(400).send({ status: 'error', message: 'companyname is required' });
  }

  const sql = `
    INSERT INTO companynames (companyname, companyDescription, companyLogo)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [companyname, companyDescription, companyLogo], (err, result) => {
    if (err) {
      console.error('Error adding company:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    res.send({ status: 'ok', message: 'Company added successfully', insertId: result.insertId });
  });
});


// Get company logo
app.get('/companylogos/:id', (req, res) => {
  const companyId = req.params.id;

  const sql = 'SELECT companyLogo FROM companynames WHERE companynameID = ?';
  db.query(sql, [companyId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ status: 'error', message: 'Logo not found' });
    }

    const logo = results[0].companyLogo;

    if (!logo) {
      return res.status(404).send({ status: 'error', message: 'Logo not stored' });
    }

    res.set('Content-Type', 'image/png');
    res.send(logo);
  });
});


// Get all company names
app.get('/companynames', (req, res) => {
  const sql = 'SELECT companynameID, companyname, companyDescription FROM companynames';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching company names:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    res.send({ status: 'ok', data: results });
  });
});

// Get company name by ID
app.get('/companynames/:id', (req, res) => {
  const companyId = req.params.id;
  const sql = 'SELECT companynameID, companyname, companyDescription FROM companynames WHERE companynameID = ?';
  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching company:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).send({ status: 'error', message: 'Company not found' });
    }
    res.send({ status: 'ok', data: results[0] });
  });
});

// Update company by ID (excluding logo update here)
app.put('/companynames/:id', (req, res) => {
  const companyId = req.params.id;
  const { companyname, companyDescription } = req.body;

  if (!companyname) {
    return res.status(400).send({ status: 'error', message: 'companyname is required' });
  }

  const sql = 'UPDATE companynames SET companyname = ?, companyDescription = ? WHERE companynameID = ?';
  db.query(sql, [companyname, companyDescription, companyId], (err, result) => {
    if (err) {
      console.error('Error updating company:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'Company not found' });
    }
    res.send({ status: 'ok', message: 'Company updated successfully' });
  });
});

// Delete company by ID
app.delete('/companynames/:id', (req, res) => {
  const companyId = req.params.id;
  const sql = 'DELETE FROM companynames WHERE companynameID = ?';
  db.query(sql, [companyId], (err, result) => {
    if (err) {
      console.error('Error deleting company:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'Company not found' });
    }
    res.send({ status: 'ok', message: 'Company deleted successfully' });
  });
});



app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
