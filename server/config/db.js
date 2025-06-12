require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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