const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const util = require('util');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });


const app = express();
const port = 5137;




// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.0.103:5173',
    'http://192.168.0.103:5174',
    'http://192.168.111.140:5173',
    'http://192.168.111.140:5174',
  ],
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


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.0.103:5173',
      'http://192.168.0.103:5174',
      'http://192.168.111.140:5173',
      'http://192.168.111.140:5174',
    ],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('joinTeam', (teamId) => {
    socket.join(`team_${teamId}`);
  });

  socket.on('sendMessage', (data) => {
    const { team_id, sender_name, message } = data;

    // Save message to DB
    db.query(
      'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
      [team_id, sender_name, message],
      (err, result) => {
        if (!err) {
          const newMessage = {
            id: result.insertId,
            team_id,
            sender_name,
            message,
            created_at: new Date()
          };
          // Broadcast to team room
          io.to(`team_${team_id}`).emit('receiveMessage', newMessage);
        }
      }
    );
  });

  socket.on('disconnect', () => {
  });
});


app.post('/messages', (req, res) => {
  const { team_id, sender_name, message } = req.body;
  db.query(
    'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
    [team_id, sender_name, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to insert message' });
      res.status(201).json({ id: result.insertId, team_id, sender_name, message });
    }
  );
});

app.get('/messages/:teamId', (req, res) => {
  const { teamId } = req.params;
  db.query(
    'SELECT * FROM team_messages WHERE team_id = ? ORDER BY created_at ASC',
    [teamId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
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

// Get all messages
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM team_messages ORDER BY created_at ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
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



// GET /unassigned-users
app.get('/unassigned-users', (req, res) => {

  const query = `
    SELECT * FROM users 
    WHERE role = 'user' AND userID NOT IN (
      SELECT team_member_id FROM team_assignments
    )
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    res.json({ status: 'ok', data: results });
  });
});


// GET /unassigned-team-leaders
app.get('/unassigned-team-leaders', (req, res) => {
  const query = `
    SELECT * FROM users 
    WHERE role = 'team leader' AND userID NOT IN (
      SELECT team_leader_id FROM team_assignments
    )
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    res.json({ status: 'ok', data: results });
  });
});



// Login user track user activity
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = results[0];

    const ip =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Log user login
    const logSql = 'INSERT INTO user_activity_log (username, role, action, ip_address) VALUES (?, ?, ?, ?)';
    db.query(logSql, [user.username, user.Role, 'login', ip], (logErr) => {
      if (logErr) {
        console.error('Failed to log user login activity:', logErr);
      }
    });

    res.json({
      status: 'success',
      user: {
        userID: user.userID,
        username: user.username,
        name: user.Name,
        role: user.Role,
      },
    });
  });
});


app.post('/logout', (req, res) => {
  const { username, role } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const logSql = 'INSERT INTO user_activity_log (username, role, action, ip_address) VALUES (?, ?, ?, ?)';
  db.query(logSql, [username, role, 'logout', ip], (logErr) => {
    if (logErr) {
      console.error('Failed to log user logout activity:', logErr);
      return res.status(500).json({ status: 'error', message: 'Logout logging failed' });
    }

    res.json({ status: 'success', message: 'Logout logged' });
  });
});

// Get user activities by username
app.get('/user-activities/:username', (req, res) => {
  const { username } = req.params;

  const sql = 'SELECT * FROM user_activity_log WHERE username = ? ORDER BY timestamp DESC';

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Failed to fetch user activities:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    res.json(results);
  });
});



// DELETE /user-activity/:id
app.delete('/user-activity/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM user_activity_log WHERE user_activity_log.id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete activity' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
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


// 👉 Upload profile image
// Create profile_images table if not exists
const createProfileImagesTable = `CREATE TABLE IF NOT EXISTS profile_images (
  imageID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  imagePath VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
)`;

db.query(createProfileImagesTable, (err) => {
  if (err) console.error('Error creating profile_images table:', err);
  else console.log('');
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Profile Image Routes
// Upload or Update profile image
app.post('/profile-image/:userID', upload.single('image'), (req, res) => {
  const { userID } = req.params;
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  // First check if user exists
  db.query('SELECT 1 FROM users WHERE userID = ?', [userID], (err, userResult) => {
    if (err) return res.status(500).send({ error: err.message });
    if (userResult.length === 0) return res.status(404).send({ error: 'User not found' });

    // Check if user already has a profile image
    db.query('SELECT imagePath FROM profile_images WHERE userID = ?', [userID], (err, result) => {
      if (err) return res.status(500).send({ error: err.message });

      const imagePath = req.file.path;
      
      if (result.length > 0) {
        // Update existing image
        const oldImagePath = result[0].imagePath;
        // Delete old file
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });

        db.query(
          'UPDATE profile_images SET imagePath = ? WHERE userID = ?',
          [imagePath, userID],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image updated successfully', imagePath });
          }
        );
      } else {
        // Insert new image
        db.query(
          'INSERT INTO profile_images (userID, imagePath) VALUES (?, ?)',
          [userID, imagePath],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image uploaded successfully', imagePath });
          }
        );
      }
    });
  });
});

// Get profile image
app.get('/profile-image/:userID', (req, res) => {
  const { userID } = req.params;
  
  db.query(
    'SELECT imagePath FROM profile_images WHERE userID = ?',
    [userID],
    (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

      const imagePath = result[0].imagePath;
      res.sendFile(path.join(__dirname, imagePath));
    }
  );
});

// Delete profile image
app.delete('/profile-image/:userID', (req, res) => {
  const { userID } = req.params;
  
  db.query(
    'SELECT imagePath FROM profile_images WHERE userID = ?',
    [userID],
    (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

      const imagePath = result[0].imagePath;
      
      // Delete file from filesystem
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
        
        // Delete record from database
        db.query(
          'DELETE FROM profile_images WHERE userID = ?',
          [userID],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image deleted successfully' });
          }
        );
      });
    }
  );
});



// Movement data save
// Assuming you have your express app and db connection initialized above this
app.post('/add_movement', (req, res) => {
  const {
    userID,
    username,
    visitingStatus,
    placeName,
    partyName,
    purpose,
    remark,
    punchTime,
    punchingTime
  } = req.body;

  const sql = `INSERT INTO movementdata 
    (userID, username, visitingStatus, placeName, partyName, purpose, remark, punchTime, punchingTime) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    userID, username, visitingStatus,
    placeName, partyName, purpose,
    remark, punchTime, punchingTime
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Movement record added', id: result.insertId });
  });
});


// Get all movement records 
app.get('/get_all_movement', (req, res) => {
  db.query('SELECT * FROM movementdata ORDER BY dateTime DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Get all movement records by userID
app.get('/get_movement/:userID', (req, res) => {
  const userID = req.params.userID;
  const sql = 'SELECT * FROM movementdata WHERE userID = ? ORDER BY dateTime DESC';

  db.query(sql, [userID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No movement records found for this user.' });
    }

    res.json(result);
  });
});



// UPDATE: Update movement record by ID (including punchingTime)
app.put('/update_movement/:id', (req, res) => {
  const id = req.params.id;
  const {
    userID,
    username,
    visitingStatus,
    placeName,
    partyName,
    purpose,
    remark,
    punchTime,
    punchingTime
  } = req.body;

  const sql = `UPDATE movementdata SET 
    userID = ?, username = ?, visitingStatus = ?, placeName = ?, 
    partyName = ?, purpose = ?, remark = ?, punchTime = ?, punchingTime = ?
    WHERE movementID = ?`;

  db.query(sql, [
    userID, username, visitingStatus, placeName,
    partyName, purpose, remark, punchTime, punchingTime, id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Movement record updated' });
  });
});

// DELETE: Remove a movement record
app.delete('/delete_movement/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM movementdata WHERE movementID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Movement record deleted' });
  });
});



const query = util.promisify(db.query).bind(db);
// Movement edit history
app.post('/movement_edit_logs', async (req, res) => {
  const { movementID, userID, originalData, updatedData } = req.body;

  if (!movementID || !userID || !originalData || !updatedData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = `
      INSERT INTO movement_edit_logs (movementID, userID, originalData, updatedData)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [
      movementID,
      userID,
      JSON.stringify(originalData),
      JSON.stringify(updatedData),
    ]);

    res.status(201).json({ message: 'Edit log saved' });
  } catch (err) {
    console.error('Error saving edit log:', err);
    res.status(500).json({ error: 'Failed to save edit log' });
  }
});

// Example endpoint: Get all movement edit logs
app.get('/movement_edit_logs', async (req, res) => {
  try {
    const sql = `SELECT * FROM movement_edit_logs ORDER BY editTime DESC`;
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching edit logs:', err);
    res.status(500).json({ error: 'Failed to fetch edit logs' });
  }
});





const storage = multer.memoryStorage();

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


app.post('/assign-team', (req, res) => {
  const { team_leader_id, team_member_ids, team_name } = req.body;

  if (!team_leader_id || !Array.isArray(team_member_ids) || team_member_ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid data' });
  }

  // Get next team_id
  const getMaxTeamIdQuery = 'SELECT MAX(team_id) AS max_id FROM team_assignments';
  db.query(getMaxTeamIdQuery, (err, maxResult) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    const nextTeamId = (maxResult[0].max_id || 0) + 1;

    // Insert records
    const insertQuery = 'INSERT INTO team_assignments (team_id, team_name, team_leader_id, team_member_id) VALUES ?';
    const values = team_member_ids.map(memberId => [nextTeamId, team_name, team_leader_id, memberId]);

    db.query(insertQuery, [values], (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });

      res.json({ status: 'ok', message: 'Team created successfully' });
    });
  });
});



app.get('/teams', (req, res) => {
  const sql = `
    SELECT 
      ta.team_id,
      MAX(ta.team_name) AS team_name,
      l.Name AS team_leader_name,
      GROUP_CONCAT(m.Name) AS team_members,
      GROUP_CONCAT(m.userID) AS team_member_ids
    FROM team_assignments ta
    JOIN users l ON ta.team_leader_id = l.userID
    JOIN users m ON ta.team_member_id = m.userID
    JOIN (
      SELECT team_id, team_leader_id FROM team_assignments GROUP BY team_id
    ) t ON ta.team_id = t.team_id
    GROUP BY ta.team_id, l.Name
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    res.json({ status: 'ok', data: result });
  });
});



// GET a single team by ID
app.get('/teams/:id', (req, res) => {
  const teamId = req.params.id;

  // Updated query to get team details by team_id
  const sql = `
    SELECT 
      ta.team_id,
      MAX(ta.team_name) AS team_name,
      l.userID AS leader_id,
      l.Name AS team_leader_name,
      u.userID AS member_id,
      u.Name AS member_name
    FROM team_assignments ta
    JOIN users l ON ta.team_leader_id = l.userID
    JOIN users u ON ta.team_member_id = u.userID
    WHERE ta.team_id = ?
    GROUP BY ta.team_id, l.userID, u.userID
  `;

  db.query(sql, [teamId], (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Team not found' });
    }

    const team = {
      team_id: results[0].team_id,
      team_name: results[0].team_name,
      team_leader: {
        userID: results[0].leader_id,
        name: results[0].team_leader_name
      },
      team_members: results.map(row => ({
        userID: row.member_id,
        name: row.member_name
      }))
    };

    res.json({ status: 'ok', data: team });
  });
});




// UPDATE a team by ID
app.put('/teams/:id', (req, res) => {
  const teamId = req.params.id;
  const { team_leader_id, team_member_ids } = req.body;

  if (!team_leader_id || !Array.isArray(team_member_ids) || team_member_ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid data' });
  }

  // Delete existing team
  const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ?';

  db.query(deleteQuery, [teamId], (err) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    // Insert updated members
    const insertQuery = 'INSERT INTO team_assignments (team_id, team_leader_id, team_member_id) VALUES ?';
    const values = team_member_ids.map(memberId => [teamId, team_leader_id, memberId]);

    db.query(insertQuery, [values], (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      res.json({ status: 'ok', message: 'Team updated successfully' });
    });
  });
});


// Delete a team by ID
app.delete('/teams/:id', (req, res) => {
  const teamId = req.params.id;

  const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ?';

  db.query(deleteQuery, [teamId], (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Team not found' });
    }

    res.json({ status: 'ok', message: 'Team deleted successfully' });
  });
});


// PATCH /teams/:id/add-member
app.patch('/teams/:id/add-member', (req, res) => {
  const teamId = req.params.id;
  const { member_id } = req.body;

  const query = 'INSERT INTO team_assignments (team_id, team_leader_id, team_member_id) SELECT ?, team_leader_id, ? FROM team_assignments WHERE team_id = ? LIMIT 1';
  db.query(query, [teamId, member_id, teamId], (err) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    res.json({ status: 'ok', message: 'Member added' });
  });
});


// DELETE /teams/:id/remove-member
// PATCH /teams/:id/remove-member
app.patch('/teams/:id/remove-member', (req, res) => {
  const { id: teamID } = req.params;
  const { member_id } = req.body;

  if (!member_id) {
    return res.status(400).json({ status: 'error', message: 'member_id is required' });
  }

  // Check if member exists in team
  const checkQuery = 'SELECT * FROM team_assignments WHERE team_id = ? AND team_member_id = ?';
  db.query(checkQuery, [teamID, member_id], (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Member not found in team' });
    }

    // Optional: Prevent leader removal (if needed)
    const isLeader = results[0].team_leader_id === member_id;
    if (isLeader) {
      return res.status(400).json({ status: 'error', message: 'Cannot remove the team leader' });
    }

    // Check team size to avoid removing the last member
    const countQuery = 'SELECT COUNT(*) AS memberCount FROM team_assignments WHERE team_id = ?';
    db.query(countQuery, [teamID], (err, countResults) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });

      if (countResults[0].memberCount <= 1) {
        return res.status(400).json({ status: 'error', message: 'Cannot remove the last member of the team' });
      }

      // Proceed with deletion
      const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ? AND team_member_id = ?';
      db.query(deleteQuery, [teamID, member_id], (err, result) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });

        res.json({ status: 'ok', message: 'Member removed successfully' });
      });
    });
  });
});





// App listerner
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});