import chokidar from "chokidar";
import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import clipboard from "clipboardy";
import minimist from "minimist";

dotenv.config();

interface Arguments {
  // The path to the project folder where CCA will scan for changes
  projectFolderPath?: string;
  // The file name for the generated patch file that CCA will use to apply changes each time file changes are detected
  patchFileName?: string;
  // The path to the .patch file that will be used by CCA to apply project changes
  patchFilePath?: string;
  // The file name for the generated response file that CCA will overwrite each time project changes are detected
  outputFileName?: string;
  // The target path for the generated response file
  outputFilePath?: string;
  // Used to provide additional file names to ignore during project watch
  ignoredFiles?: string;
  // Used to provide additional file directory names to ignore during project watch
  ignoredDirectories?: string;
}

// @ts-ignore because this works
const argv: Arguments = minimist(process.argv.slice(2));

const projectFolderPath: string =
  argv.projectFolderPath || process.env.PROJECT_FOLDER_PATH || "src";
const patchFileName: string =
  argv.patchFileName || process.env.PATCH_FILE_NAME || "contrail.patch";
const patchFilePath: string =
  argv.patchFilePath ||
  process.env.PATCH_FILE_PATH ||
  `.contrail/${patchFileName}`;
const outputFileName: string =
  argv.outputFileName ||
  process.env.OUTPUT_FILE_NAME ||
  "contrail_prepared_response.txt";
const outputFilePath: string =
  argv.outputFilePath ||
  process.env.OUTPUT_FILE ||
  `.contrail/${outputFileName}`;
const additionalIgnoredFiles: string =
  argv.ignoredFiles || process.env.IGNORED_FILES || "";
const additionalIgnoredDirectories: string =
  argv.ignoredDirectories || process.env.IGNORED_DIRECTORIES || "";

const ignoredFiles: string[] = ["LICENSE"].concat(
  additionalIgnoredFiles?.split(",")
);

const ignoredDirectories: string[] = [".vscode", ".idea", ".git", "node_modules", "dist", ".contrail"].concat(
  additionalIgnoredDirectories?.split(",")
);

function readFolderContents(folderPath: string): string {
  let fileContents = "";

  const files = fs.readdirSync(folderPath);
  files.forEach((fileName) => {
    if (!ignoredFiles.includes(fileName)) {

      const filePath = path.join(folderPath, fileName);

      if (fs.statSync(filePath).isDirectory()) {
        if (!ignoredDirectories.includes(fileName)) {
          fileContents += readFolderContents(filePath);
        } else {
          console.log("directory ignored", fileName);
        }
      } else {
        const fileContent = fs.readFileSync(filePath, "utf8");
        fileContents += `File Path: ${filePath}\n\n${fileContent}\n\n`;
      }
    } else {
      console.log("file ignored", fileName);
    }
  });

  return fileContents;
}

function saveProjectContents(): void {
  const fileContents = readFolderContents(projectFolderPath);
  const generatedResponse = `
Generate a git patch file (remember to end the diff with --) that will describe project changes aimed to accomplish the following:

<continue here>

Here is the project content for context:

${fileContents}`;
  fs.writeFileSync(outputFilePath, generatedResponse, "utf8");
  console.log(`Project contents saved to ${outputFilePath}`);
  clipboard.writeSync(generatedResponse);
  console.log("Project contents copied to clipboard");
}

function applyPatch(): void {
  exec(`git apply ${patchFilePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error applying patch: ${error}`);

      return;
    }

    if (stderr) {
      console.error(`Error output: ${stderr}`);

      return;
    }

    console.log(`Patch applied successfully: ${stdout}`);

    // Save project contents and copy to clipboard after patch is applied
    saveProjectContents();
  });
}

const projectWatcher = chokidar.watch(projectFolderPath, {
  persistent: true,
  ignoreInitial: true
});

projectWatcher.on("change", () => {
  console.log(`Detected changes in ${projectFolderPath}`);
  saveProjectContents();
});

const patchWatcher = chokidar.watch(patchFilePath, {
  persistent: true,
  ignoreInitial: true
});

patchWatcher.on("change", () => {
  console.log(`Detected changes in ${patchFilePath}`);
  applyPatch();
});
