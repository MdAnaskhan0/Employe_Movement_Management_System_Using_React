const db = require('../config/db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.uploadImage = async (req, res) => {
  const { userID } = req.params;

  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  // Check if user exists
  db.query('SELECT 1 FROM users WHERE userID = ?', [userID], async (err, userResult) => {
    if (err) return res.status(500).send({ error: err.message });
    if (userResult.length === 0) return res.status(404).send({ error: 'User not found' });

    // Upload image to Cloudinary
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'userprofiles',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    try {
      const result = await streamUpload(req.file.buffer);
      const imageUrl = result.secure_url;

      // Check if already has image
      db.query('SELECT imagePath FROM profile_images WHERE userID = ?', [userID], (err, result) => {
        if (err) return res.status(500).send({ error: err.message });

        if (result.length > 0) {
          // Update
          db.query(
            'UPDATE profile_images SET imagePath = ? WHERE userID = ?',
            [imageUrl, userID],
            (err) => {
              if (err) return res.status(500).send({ error: err.message });
              res.send({ message: 'Profile image updated', imageUrl });
            }
          );
        } else {
          // Insert
          db.query(
            'INSERT INTO profile_images (userID, imagePath) VALUES (?, ?)',
            [userID, imageUrl],
            (err) => {
              if (err) return res.status(500).send({ error: err.message });
              res.send({ message: 'Profile image uploaded', imageUrl });
            }
          );
        }
      });
    } catch (uploadErr) {
      res.status(500).send({ error: 'Upload failed', details: uploadErr.message });
    }
  });
};

exports.getImage = (req, res) => {
  const { userID } = req.params;

  db.query('SELECT imagePath FROM profile_images WHERE userID = ?', [userID], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

    const imageUrl = result[0].imagePath;
    res.send({ imageUrl }); // frontend can render this
  });
};

exports.deleteImage = (req, res) => {
  const { userID } = req.params;

  db.query('SELECT imagePath FROM profile_images WHERE userID = ?', [userID], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

    const imageUrl = result[0].imagePath;

    // You can optionally also delete the image from Cloudinary using public_id
    // But for now, just delete from DB
    db.query('DELETE FROM profile_images WHERE userID = ?', [userID], (err) => {
      if (err) return res.status(500).send({ error: err.message });
      res.send({ message: 'Profile image deleted' });
    });
  });
};
