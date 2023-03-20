"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
// @ts-ignore
const argv = (0, minimist_1.default)(process.argv.slice(2));
const projectFolderPath = argv.projectFolderPath || process.env.PROJECT_FOLDER_PATH || "src";
const patchFileName = argv.patchFileName || process.env.PATCH_FILE_NAME || "contrail.patch";
const patchFilePath = argv.patchFilePath ||
    process.env.PATCH_FILE_PATH ||
    `.contrail/${patchFileName}`;
const outputFileName = argv.outputFileName ||
    process.env.OUTPUT_FILE_NAME ||
    "contrail_prepared_response.txt";
const outputFilePath = argv.outputFilePath ||
    process.env.OUTPUT_FILE ||
    `.contrail/${outputFileName}`;
const additionalIgnoredFiles = argv.ignoredFiles || process.env.IGNORED_FILES || "";
const additionalIgnoredDirectories = argv.ignoredDirectories || process.env.IGNORED_DIRECTORIES || "";
const ignoredFiles = ["contrail_prepared_response.txt"].concat(additionalIgnoredFiles?.split(","));
function readFolderContents(folderPath) {
    let fileContents = "";
    const files = fs_extra_1.default.readdirSync(folderPath);
    files.forEach((fileName) => {
        if (ignoredFiles.includes(fileName))
            return;
        const filePath = path_1.default.join(folderPath, fileName);
        if (fs_extra_1.default.statSync(filePath).isDirectory()) {
            fileContents += readFolderContents(filePath);
        }
        else {
            const fileContent = fs_extra_1.default.readFileSync(filePath, "utf8");
            fileContents += `File: ${filePath}\n\n${fileContent}\n\n`;
        }
    });
    return fileContents;
}
function saveProjectContents() {
    const fileContents = readFolderContents(projectFolderPath);
    const generatedResponse = `
Generate a git patch file that will describe project changes aimed to accomplish the following:

<continue here>

Here is the project content for context:

${fileContents}`;
    fs_extra_1.default.writeFileSync(outputFilePath, generatedResponse, "utf8");
    console.log(`Project contents saved to ${outputFilePath}`);
    // clipboardy.writeSync(generatedResponse);
    // console.log("Project contents copied to clipboard");
}
function applyPatch() {
    (0, child_process_1.exec)(`git am < ${patchFilePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error applying patch: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
        }
        console.log(`Patch applied successfully: ${stdout}`);
        // Save project contents and copy to clipboard after patch is applied
        saveProjectContents();
    });
}
const projectWatcher = chokidar_1.default.watch(projectFolderPath, {
    persistent: true,
    ignoreInitial: true,
});
projectWatcher.on("change", () => {
    console.log(`Detected changes in ${projectFolderPath}`);
    saveProjectContents();
});
const patchWatcher = chokidar_1.default.watch(patchFilePath, {
    persistent: true,
    ignoreInitial: true,
});
patchWatcher.on("change", () => {
    console.log(`Detected changes in ${patchFilePath}`);
    applyPatch();
});
//# sourceMappingURL=index.js.map