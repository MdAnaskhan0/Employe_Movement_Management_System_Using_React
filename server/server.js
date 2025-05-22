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
    email,
    role
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

    // Insert the new user (✅ fixed: added correct number of placeholders - 10)
    const insertSql = `
      INSERT INTO users 
      (username, password, E_ID, Name, Designation, Department, Company_name, Phone, email, Role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      email,
      role
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




// Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ status: 'error', message: 'Error logging in' });
    }
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
// const fs = require('fs');
// const baseDir = path.join(__dirname, 'JsonFile');

// app.post('/update-json', (req, res) => {
//   const { fileName, value } = req.body;

//   if (!fileName || !value) {
//     return res.status(400).json({ error: 'fileName and value are required' });
//   }

//   const filePath = path.join(baseDir, `${fileName}.json`);

//   // If file doesn't exist, create it with empty array
//   if (!fs.existsSync(filePath)) {
//     fs.writeFileSync(filePath, '[]');
//   }

//   // Read and parse the file
//   fs.readFile(filePath, 'utf-8', (err, data) => {
//     if (err) return res.status(500).json({ error: 'Failed to read file' });

//     let json = [];

//     try {
//       json = JSON.parse(data);
//       if (!Array.isArray(json)) json = [];
//     } catch (e) {
//       return res.status(500).json({ error: 'Invalid JSON format' });
//     }

//     // Check if value already exists (case-insensitive)
//     const alreadyExists = json.some(item =>
//       typeof item === 'string' ? item.toLowerCase() === value.toLowerCase() : item === value
//     );

//     if (alreadyExists) {
//       return res.status(409).json({ message: 'Value already exists', data: json });
//     }

//     json.push(value);

//     fs.writeFile(filePath, JSON.stringify(json, null, 2), err => {
//       if (err) return res.status(500).json({ error: 'Failed to write file' });
//       res.json({ message: 'Successfully updated', data: json });
//     });
//   });
// });


// // Get JSON file data
// app.get('/get-json/:fileName', (req, res) => {
//   const fileName = req.params.fileName;
//   const filePath = path.join(baseDir, `${fileName}.json`);

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: 'File not found' });
//   }

//   fs.readFile(filePath, 'utf-8', (err, data) => {
//     if (err) return res.status(500).json({ error: 'Failed to read file' });

//     try {
//       const jsonData = JSON.parse(data);
//       res.json({ data: jsonData });
//     } catch (e) {
//       res.status(500).json({ error: 'Invalid JSON format' });
//     }
//   });
// });

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


// Company Names API
app.post('/companynames', upload.single('companyLogo'), (req, res) => {
  const { companyname, companyDescription } = req.body;
  const companyLogo = req.file ? req.file.buffer : null;
  const companyLogoType = req.file ? req.file.mimetype : null;

  if (!companyname) {
    return res.status(400).send({ status: 'error', message: 'companyname is required' });
  }

  const sql = `
  INSERT INTO companynames (companyname, companyDescription, companyLogo, companyLogoType)
  VALUES (?, ?, ?, ?)
`;

  db.query(sql, [companyname, companyDescription, companyLogo, companyLogoType], (err, result) => {
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
  const sql = 'SELECT companyLogo, companyLogoType FROM companynames WHERE companynameID = ?';

  db.query(sql, [companyId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send({ status: 'error', message: 'Logo not found' });
    }

    const { companyLogo, companyLogoType } = results[0];

    if (!companyLogo) {
      return res.status(404).send({ status: 'error', message: 'Logo not stored' });
    }

    res.set('Content-Type', companyLogoType || 'image/png');
    res.send(companyLogo);
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
app.put('/companynames/:id', upload.single('companyLogo'), (req, res) => {
  const companyId = req.params.id;
  const { companyname, companyDescription } = req.body;
  const companyLogo = req.file ? req.file.buffer : null;
  const companyLogoType = req.file ? req.file.mimetype : null;

  if (!companyname) {
    return res.status(400).send({ status: 'error', message: 'companyname is required' });
  }

  const updateFields = [];
  const values = [];

  updateFields.push('companyname = ?');
  values.push(companyname);

  updateFields.push('companyDescription = ?');
  values.push(companyDescription);

  if (companyLogo) {
    updateFields.push('companyLogo = ?');
    updateFields.push('companyLogoType = ?');
    values.push(companyLogo, companyLogoType);
  }

  values.push(companyId);

  const sql = `UPDATE companynames SET ${updateFields.join(', ')} WHERE companynameID = ?`;
  db.query(sql, values, (err, result) => {
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


// // GET all partynames
app.get('/partynames', (req, res) => {
  db.query('SELECT * FROM partynames', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// GET a single partyname by ID
app.get('/partynames/:id', (req, res) => {
  db.query('SELECT * FROM partynames WHERE partynameID = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'Partyname not found' });
    res.json(results[0]);
  });
});

app.post('/partynames', (req, res) => {
  const { partyname, partyaddress } = req.body;

  if (!partyname || !partyaddress) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  const checkSql = 'SELECT 1 FROM partynames WHERE partyname = ? LIMIT 1';
  db.query(checkSql, [partyname], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking party name:', checkErr);
      return res.status(500).send({ message: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).send({ message: 'Party name already exists' });
    }

    const insertSql = 'INSERT INTO partynames (partyname, partyaddress) VALUES (?, ?)';
    db.query(insertSql, [partyname, partyaddress], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting party name:', insertErr);
        return res.status(500).send({ message: 'Database error' });
      }

      res.status(201).send({ id: result.insertId, partyname, partyaddress });
    });
  });
});


// PUT (update) a partyname
app.put('/partynames/:id', (req, res) => {
  const { partyname, partyaddress } = req.body;
  db.query(
    'UPDATE partynames SET partyname = ?, partyaddress = ? WHERE partynameID = ?',
    [partyname, partyaddress, req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Partyname not found' });
      res.send({ message: 'Updated successfully' });
    }
  );
});

// DELETE a partyname
app.delete('/partynames/:id', (req, res) => {
  db.query('DELETE FROM partynames WHERE partynameID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ message: 'Partyname not found' });
    res.send({ message: 'Deleted successfully' });
  });
});



// ----------------------------------
// POST /departments - Create new department
app.post('/departments', (req, res) => {
  const { departmentName } = req.body;

  if (!departmentName) {
    return res.status(400).send({ message: 'Department name is required' });
  }

  // Check if departmentName already exists
  const checkSql = 'SELECT 1 FROM departments WHERE departmentName = ? LIMIT 1';
  db.query(checkSql, [departmentName], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking department name:', checkErr);
      return res.status(500).send({ message: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).send({ message: 'Department name is already exist' });
    }

    // Insert new department if not exists
    const insertSql = 'INSERT INTO departments (departmentName) VALUES (?)';
    db.query(insertSql, [departmentName], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting department:', insertErr);
        return res.status(500).send({ message: 'Database error' });
      }

      res.status(201).send({ id: result.insertId, departmentName });
    });
  });
});


// GET /departments - Get all departments
app.get('/departments', (req, res) => {
  const sql = 'SELECT * FROM departments';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

// GET /departments/:id - Get a single department by ID
app.get('/departments/:id', (req, res) => {
  const sql = 'SELECT * FROM departments WHERE departmentID = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'Department not found' });
    res.send(results[0]);
  });
});

// PUT /departments/:id - Update department name
app.put('/departments/:id', (req, res) => {
  const { departmentName } = req.body;
  const sql = 'UPDATE departments SET departmentName = ? WHERE departmentID = ?';
  db.query(sql, [departmentName, req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ message: 'Department not found' });
    res.send({ message: 'Department updated' });
  });
});

// DELETE /departments/:id - Delete a department
app.delete('/departments/:id', (req, res) => {
  const sql = 'DELETE FROM departments WHERE departmentID = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send({ message: 'Department not found' });
    res.send({ message: 'Department deleted' });
  });
});


// Create - Add new branchname
app.post('/branchnames', (req, res) => {
  const { branchname, address } = req.body;

  if (!branchname || !address) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // Check if branchname already exists
  const checkSql = 'SELECT 1 FROM branchnames WHERE branchname = ? LIMIT 1';
  db.query(checkSql, [branchname], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking branchname:', checkErr);
      return res.status(500).json({ error: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ message: 'branchname is already exist' });
    }

    // Insert new branch if not exists
    const insertSql = 'INSERT INTO branchnames (branchname, address) VALUES (?, ?)';
    db.query(insertSql, [branchname, address], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting branch:', insertErr);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'Branch created', id: result.insertId });
    });
  });
});


// Read - Get all branches
app.get('/branchnames', (req, res) => {
  db.query('SELECT * FROM branchnames', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Read - Get single branch by ID
app.get('/branchnames/:id', (req, res) => {
  db.query('SELECT * FROM branchnames WHERE branchnameID = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Branch not found' });
    res.json(results[0]);
  });
});

// Update - Modify branch by ID
app.put('/branchnames/:id', (req, res) => {
  const { branchname, address } = req.body;
  const sql = 'UPDATE branchnames SET branchname = ?, address = ? WHERE branchnameID = ?';
  db.query(sql, [branchname, address, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Branch updated' });
  });
});

// Delete - Remove branch by ID
app.delete('/branchnames/:id', (req, res) => {
  db.query('DELETE FROM branchnames WHERE branchnameID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Branch deleted' });
  });
});


// GET all designations
app.get('/designations', (req, res) => {
  db.query('SELECT * FROM designations', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET a single designation by ID
app.get('/designations/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM designations WHERE designationID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Designation not found' });
    res.json(results[0]);
  });
});

// POST a new designation
app.post('/designations', (req, res) => {
  const { designationName } = req.body;
  if (!designationName) {
    return res.status(400).json({ error: 'designationName is required' });
  }

  // Check if designationName already exists
  const checkSql = 'SELECT 1 FROM designations WHERE designationName = ? LIMIT 1';
  db.query(checkSql, [designationName], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking designation name:', checkErr);
      return res.status(500).json({ error: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Designation name already exists' });
    }

    // Insert new designation if not exists
    const insertSql = 'INSERT INTO designations (designationName) VALUES (?)';
    db.query(insertSql, [designationName], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting designation:', insertErr);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'Designation created', id: result.insertId });
    });
  });
});


// PUT to update a designation
app.put('/designations/:id', (req, res) => {
  const { id } = req.params;
  const { designationName } = req.body;
  if (!designationName) return res.status(400).json({ error: 'designationName is required' });

  db.query('UPDATE designations SET designationName = ? WHERE designationID = ?', [designationName, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found' });
    res.json({ message: 'Designation updated' });
  });
});

// DELETE a designation
app.delete('/designations/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM designations WHERE designationID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found' });
    res.json({ message: 'Designation deleted' });
  });
});



// ---------------------------
// POST: Create a new visiting status
// ---------------------------
app.post('/visitingstatus', (req, res) => {
  const { visitingstatusname } = req.body;

  if (!visitingstatusname) {
    return res.status(400).json({ error: 'visitingstatusname is required' });
  }

  const checkSql = 'SELECT 1 FROM visitingstatus WHERE visitingstatusname = ? LIMIT 1';
  db.query(checkSql, [visitingstatusname], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking visiting status:', checkErr);
      return res.status(500).json({ error: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Visiting status name already exists' });
    }

    const insertSql = 'INSERT INTO visitingstatus (visitingstatusname) VALUES (?)';
    db.query(insertSql, [visitingstatusname], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error inserting visiting status:', insertErr);
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ id: insertResult.insertId, visitingstatusname });
    });
  });
});



// ---------------------------
// GET: All visiting statuses
// ---------------------------
app.get('/visitingstatus', (req, res) => {
  db.query('SELECT * FROM visitingstatus', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------------------------
// GET one visiting status by ID
// ---------------------------
app.get('/visitingstatus/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM visitingstatus WHERE visitingstatusID = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  });
});

// ---------------------------
// PUT update visiting status
// ---------------------------
app.put('/visitingstatus/:id', (req, res) => {
  const { id } = req.params;
  const { visitingstatusname } = req.body;
  db.query(
    'UPDATE visitingstatus SET visitingstatusname = ? WHERE visitingstatusID = ?',
    [visitingstatusname, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ id, visitingstatusname });
    }
  );
});

// ---------------------------
// DELETE visiting status
// ---------------------------
app.delete('/visitingstatus/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'DELETE FROM visitingstatus WHERE visitingstatusID = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    }
  );
});


// Add a new role
app.post('/roles', (req, res) => {
  const { rolename } = req.body;
  if (!rolename) {
    return res.status(400).json({ error: 'rolename is required' });
  }

  // Check if rolename already exists
  const checkSql = 'SELECT 1 FROM roles WHERE rolename = ? LIMIT 1';
  db.query(checkSql, [rolename], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking role name:', checkErr);
      return res.status(500).json({ error: 'Database error' });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Role name already exists' });
    }

    // Insert new role if not exists
    const insertSql = 'INSERT INTO roles (rolename) VALUES (?)';
    db.query(insertSql, [rolename], (insertErr, results) => {
      if (insertErr) {
        console.error('Error inserting role:', insertErr);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ roleID: results.insertId, rolename });
    });
  });
});


// READ all roles
app.get('/roles', (req, res) => {
  const sql = 'SELECT * FROM roles';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// READ a single role by roleID
app.get('/roles/:roleID', (req, res) => {
  const { roleID } = req.params;
  const sql = 'SELECT * FROM roles WHERE roleID = ?';
  db.query(sql, [roleID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(results[0]);
  });
});

// UPDATE a role by roleID
app.put('/roles/:roleID', (req, res) => {
  const { roleID } = req.params;
  const { rolename } = req.body;
  if (!rolename) {
    return res.status(400).json({ error: 'rolename is required' });
  }

  const sql = 'UPDATE roles SET rolename = ? WHERE roleID = ?';
  db.query(sql, [rolename, roleID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ roleID, rolename });
  });
});

// DELETE a role by roleID
app.delete('/roles/:roleID', (req, res) => {
  const { roleID } = req.params;
  const sql = 'DELETE FROM roles WHERE roleID = ?';
  db.query(sql, [roleID], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  });
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
