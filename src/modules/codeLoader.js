const fs = require('fs').promises;
const path = require('path');

/**
 * Reads all files from a given directory and its subdirectories.
 * For now, it will focus on reading .js files, but this can be expanded.
 * @param {string} dirPath - The path to the directory.
 * @returns {Promise<Array<{path: string, content: string}>>} - A promise that resolves to an array of objects,
 *                                                              each containing the file path and its content.
 */
async function loadCodebase(dirPath) {
    const allFiles = [];
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                // TODO: Add option to include/exclude specific directories (e.g., node_modules, .git)
                if (entry.name === 'node_modules' || entry.name === '.git') {
                    continue;
                }
                allFiles.push(...await loadCodebase(fullPath));
            } else if (entry.isFile() && path.extname(entry.name) === '.js') { // Focus on .js files for now
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    allFiles.push({ path: fullPath, content });
                } catch (err) {
                    console.error(`Error reading file ${fullPath}:`, err);
                    // Optionally, decide if one error should stop the whole process
                }
            }
        }
        return allFiles;
    } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    loadCodebase,
};

// Example usage (for testing purposes):
// (async () => {
//     try {
//         const codebasePath = path.join(__dirname, '../../'); // Example: load code from project root
//         console.log(`Loading codebase from: ${codebasePath}`);
//         const files = await loadCodebase(codebasePath);
//         files.forEach(file => {
//             console.log(`\nFile: ${file.path}`);
//             // console.log(`Content:\n${file.content.substring(0, 200)}...`); // Print first 200 chars
//         });
//         console.log(`\nTotal files loaded: ${files.length}`);
//     } catch (error) {
//         console.error('Failed to load codebase:', error);
//     }
// })();
