import fs from "fs";
import path from "path";
import chokidar from "chokidar";

const DOWNLOADS_FOLDER = path.join(
  process.env.HOME || process.env.USERPROFILE,
  "Downloads",
);
const TARGET_FOLDER = path.join(
  process.env.HOME || process.env.USERPROFILE,
  "Downloads",
  "garage-cad",
);

// Ensure the target folder exists
if (!fs.existsSync(TARGET_FOLDER)) {
  fs.mkdirSync(TARGET_FOLDER, { recursive: true });
}

// Function to move the file
const moveFile = (filePath) => {
  const fileName = path.basename(filePath);
  let targetPath = path.join(TARGET_FOLDER, fileName);

  // Check if the file already exists
  if (fs.existsSync(targetPath)) {
    const ext = path.extname(fileName);
    const name = path.basename(fileName, ext);
    let counter = 1;

    // Increment version number if file exists
    while (fs.existsSync(targetPath)) {
      const paddedCounter = String(counter).padStart(2, "0");
      targetPath = path.join(TARGET_FOLDER, `${name}-${paddedCounter}${ext}`);
      counter++;
    }
  }

  // Move the file
  fs.rename(filePath, targetPath, (err) => {
    if (err) console.error(`Error moving file: ${err}`);
    else console.log(`Moved: ${filePath} -> ${targetPath}`);
  });
};

// Watch for new `.axm` files in the Downloads folder
chokidar
  .watch(DOWNLOADS_FOLDER, { persistent: true, depth: 0 })
  .on("add", (filePath) => {
    if (filePath.endsWith(".axm")) {
      moveFile(filePath);
    }
  });

console.log(`Watching for FormIt files in ${DOWNLOADS_FOLDER}...`);
