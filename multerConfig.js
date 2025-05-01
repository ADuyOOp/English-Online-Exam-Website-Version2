/**************** prac 6 ********************/
const multer = require('multer');
const fs = require('fs'); 
const path = require('path');

const warePath = "C:\\ware"; // Destination folder

// Get all existing filenames in the ware folder (optimized for large file count)
function getExistingFilenames() {
  try {
    return new Set(fs.readdirSync(warePath)); // Use a Set for fast lookups
  } catch (err) {
    console.error("Error reading directory:", err);
    return new Set();
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Uploading to:", warePath);
    cb(null, warePath); // Save files to C:\ware
  },
  filename: function (req, file, cb) {
    const existingFiles = getExistingFilenames(); // Load file list once
    const fileExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExt);
    
    let newFileName = `${baseName}_${Date.now()}${fileExt}`;

    // Ensure filename uniqueness by regenerating if needed
    while (existingFiles.has(newFileName)) {
      newFileName = `${baseName}_${Date.now()}${fileExt}`;
    }

    console.log(`Original: ${file.originalname} → Renamed: ${newFileName}`);
    cb(null, newFileName); // Save file with new filename
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
