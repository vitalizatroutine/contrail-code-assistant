"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const clipboardy_1 = __importDefault(require("clipboardy"));
const minimist_1 = __importDefault(require("minimist"));
dotenv_1.default.config();
// @ts-ignore because this works
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
const ignoredFiles = ["LICENSE", "package-lock.json"].concat(additionalIgnoredFiles?.split(","));
const ignoredDirectories = [
    ".vscode",
    ".idea",
    ".git",
    "node_modules",
    "dist",
    ".contrail",
].concat(additionalIgnoredDirectories?.split(","));
function generateProjectTree(folderPath, depth = 0) {
    let treeContents = "";
    const files = fs_extra_1.default.readdirSync(folderPath);
    files.forEach((fileName) => {
        if (!ignoredFiles.includes(fileName)) {
            const filePath = path_1.default.join(folderPath, fileName);
            const indentation = "  ".repeat(depth);
            if (fs_extra_1.default.statSync(filePath).isDirectory()) {
                if (!ignoredDirectories.includes(fileName)) {
                    treeContents += `${indentation}- ${fileName}/\n`;
                    treeContents += generateProjectTree(filePath, depth + 1);
                }
            }
            else {
                treeContents += `${indentation}- ${filePath}\n`;
            }
        }
    });
    return treeContents;
}
function readFolderContents(folderPath) {
    let fileContents = "";
    const files = fs_extra_1.default.readdirSync(folderPath);
    files.forEach((fileName) => {
        if (!ignoredFiles.includes(fileName)) {
            const filePath = path_1.default.join(folderPath, fileName);
            if (fs_extra_1.default.statSync(filePath).isDirectory()) {
                if (!ignoredDirectories.includes(fileName)) {
                    fileContents += readFolderContents(filePath);
                }
            }
            else {
                const fileContent = fs_extra_1.default.readFileSync(filePath, "utf8");
                const fileContentWithLineNumbers = fileContent
                    .split("\n")
                    .map((line, index) => `${index + 1}: ${line}`)
                    .join("\n");
                fileContents += `File Path: ${filePath}\n\n${fileContentWithLineNumbers}\n\n`;
            }
        }
    });
    return fileContents;
}
function saveProjectContents() {
    const fileContents = readFolderContents(projectFolderPath);
    const projectTree = generateProjectTree(projectFolderPath);
    const generatedResponse = `
Please generate a standard git patch file for me. Consider the following:\n
- I am the author: Vitali Zatroutine <vitali.zatroutine@gmail.com>
- Ensure that the patch is not corrupt
- Don't add empty lines or attempt to prettify the code\n
Try to accomplish the following:\n
<continue here>\n
Here is the project tree for context:\n
${projectTree}
Here is the project content for context:\n
${fileContents}`;
    fs_extra_1.default.writeFileSync(outputFilePath, generatedResponse, "utf8");
    console.log(`Project contents saved to ${outputFilePath}`);
    clipboardy_1.default.writeSync(generatedResponse);
    console.log("Project contents copied to clipboard");
}
function applyPatch() {
    (0, child_process_1.exec)(`git apply ${patchFilePath}`, (error, stdout, stderr) => {
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