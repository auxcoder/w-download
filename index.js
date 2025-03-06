import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chokidar from "chokidar";
//
const DOWNLOADS_FOLDER = path.join(
  process.env.HOME || process.env.USERPROFILE,
  "Downloads",
);
const TARGET_FOLDER = path.join(
  process.env.HOME || process.env.USERPROFILE,
  "Downloads",
  "garage-cad",
);

// ensure the target folder exists
if (!fs.existsSync(TARGET_FOLDER)) {
  fs.mkdirSync(TARGET_FOLDER, { recursive: true });
}

// parse args
const argv = yargs(hideBin(process.argv))
  .option("dest", {
    alias: "d",
    type: "string",
    description: "Destination folder relative to process path",
    default: TARGET_FOLDER,
  })
  .help().argv;

const destPath = argv._[0];
const destinationFolder = argv.dest;
console.log(destPath);
console.log(destinationFolder);

const moveFile = (filePath) => {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  // Split name and version manually
  const parts = fileName.slice(0, -ext.length).split("-");
  let baseName = parts.slice(0, -1).join("-"); // Everything except last part
  let lastPart = parts[parts.length - 1];
  let version = 1;

  if (!isNaN(lastPart) && lastPart.length === 2) {
    // remove version from base
    baseName = parts.slice(0, -1).join("-");
    version = parseInt(lastPart, 10) + 1;
  } else {
    // no version, use full name
    baseName = fileName.slice(0, -ext.length);
  }

  let newFileName;
  let targetPath;
  let versionString;

  do {
    versionString = String(version++).padStart(2, "0");
    newFileName = `${baseName}-${versionString}${ext}`;
    targetPath = path.join(TARGET_FOLDER, newFileName);
  } while (fs.existsSync(targetPath));

  // move the file
  fs.rename(filePath, targetPath, (err) => {
    if (err) console.error(`Error moving file: ${err}`);
    else console.log(`Moved: ${filePath} -> ${targetPath}`);
  });
};

// watch for new `.axm` files
chokidar
  .watch(DOWNLOADS_FOLDER, { persistent: true, depth: 0 })
  .on("add", (filePath) => {
    if (filePath.endsWith(".axm")) {
      moveFile(filePath);
    }
  });

console.log(`Watching for FormIt files in ${DOWNLOADS_FOLDER}...`);
