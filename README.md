<p style="text-align: center">
   <img width="128" height="128" src="contrail.png" />
</p>

# Contrail Code Assistant

This script automates the process of watching for changes in your Node.js project and applying a patch file when it's detected. When a patch is detected and applied, the script saves the project contents to a specified file and copies the file contents to the clipboard.

## Features

- Watches for changes in the designated project patch file.
- Applies patch file using `git apply` when changes are detected.
- Saves the project contents to a file after the patch is applied.

### Set up the script

1. Install the package:

```sh
npm install contrail-code-assistant --save
```

2. Update the scripts section in your package.json file:

```json
{
  "scripts": {
    "contrail": "node node_modules/contrail-code-assistant/dist/index.js"
    // ...
  }
}
```

## Run the script

You can run the script using the following command:
```sh
npm run contrail
```

You can also provide custom values for the project folder path, patch file path, output file name, and output file path using environment variables or command line arguments:

1. Using environment variables:
```sh
PROJECT_FOLDER_PATH="./" PATCH_FILE_PATH=".openai/edits.patch" OUTPUT_FILE_NAME="project_contents.txt" OUTPUT_FILE="src/assets/project_contents.txt" npm run watch-and-apply
```
2. Using command line arguments:
``` sh
npm run watch-and-apply -- --projectFolderPath="./" --patchFilePath=".openai/edits.patch" --outputFileName="project_contents.txt" --outputFile="src/assets/project_contents.txt"
```

You can use a combination of environment variables and command line arguments, with command line arguments taking precedence over environment variables.

## Contributing
If you'd like to contribute to this project, please feel free to submit a pull request or open an issue for discussion.
