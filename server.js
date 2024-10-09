const express = require('express');
const fileUpload = require('express-fileupload');
const { v4: uuid } = require('uuid');
const path = require('path');
const app = express();

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable file upload using express-fileupload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Helper function to handle image upload
const imageUpload = (file, folder = 'uploads') => {
  if (!file || file.name === '') return;

  // Get file extension
  let file_extension = file.name.split('.').pop();

  // Generate unique file name using uuid
  const name = uuid() + '.' + file_extension;

  // Create the correct path by removing the extra 'uploads' from the target folder
  const filePath = path.join(__dirname, folder, name);

  // Move the file to the desired folder
  file.mv(filePath, (err) => {
    if (err) throw err;
  });

  // Return the file path
  return `/${folder}/${name}`;
};

// Route to handle file upload
app.post('/upload', (req, res) => {
  if (req.files && req.files.image) {
    const uploadedImages = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

    let bulkSaveObj = [];

    // Loop through all uploaded images
    uploadedImages.forEach(image => {
      const imageName = imageUpload(image, 'uploads');
      bulkSaveObj.push({
        media: imageName,
        postId: req.body.postId || 'default_id',  // req.body.postId might be missing
        media_type: 1,
      });
    });

    // Return response
    res.json({ success: true, files: bulkSaveObj });
  } else {
    res.status(400).send('No files uploaded.');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
