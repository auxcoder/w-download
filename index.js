import fs from "fs";
import os from "os";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chokidar from "chokidar";
//
let USER_TARGET_DEST;
const DOWNLOADS_FOLDER = path.join(
  os.homedir() || process.env.HOME || process.env.USERPROFILE,
  "Downloads",
);
const TARGET_FOLDER = path.join(
  os.homedir() || process.env.HOME || process.env.USERPROFILE,
  "Downloads",
  "cad-files",
);

// parse args
const argv = yargs(hideBin(process.argv))
  .option("dest", {
    alias: "d",
    type: "string",
    description: "Destination folder relative to process path",
    default: TARGET_FOLDER,
  })
  .strict()
  .help().argv;

// FIXME: pick and add path from file name.
if (!fs.existsSync(TARGET_FOLDER)) {
  fs.mkdirSync(TARGET_FOLDER, { recursive: true });
}
if (argv.dest && !fs.existsSync(USER_TARGET_DEST)) {
  USER_TARGET_DEST = path.join(TARGET_FOLDER, argv.dest);
  fs.mkdirSync(USER_TARGET_DEST, { recursive: true });
}

const moveFile = (filePath) => {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  // split name and version manually
  const parts = fileName.slice(0, -ext.length).split("-");
  // everything except last part
  let baseName = parts.slice(0, -1).join("-");
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
    targetPath = path.join(USER_TARGET_DEST || TARGET_FOLDER, newFileName);
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
