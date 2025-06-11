const mysql = require('mysql2');

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

// Initialize tables
const createProfileImagesTable = `CREATE TABLE IF NOT EXISTS profile_images (
  imageID INT AUTO_INCREMENT PRIMARY KEY,
  userID INT NOT NULL,
  imagePath VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
)`;

db.query(createProfileImagesTable, (err) => {
  if (err) console.error('Error creating profile_images table:', err);
});

module.exports = db;