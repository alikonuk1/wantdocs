const fs = require('fs').promises;
const path = require('path');

/**
 * Reads all Markdown files from a given directory and its subdirectories.
 * @param {string} dirPath - The path to the directory containing Markdown documentation.
 * @returns {Promise<Array<{path: string, content: string}>>} - A promise that resolves to an array of objects,
 *                                                              each containing the file path and its content.
 */
async function loadDocumentation(dirPath) {
    const allDocs = [];
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively load from subdirectories
                // TODO: Add option to include/exclude specific directories if needed
                allDocs.push(...await loadDocumentation(fullPath));
            } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    allDocs.push({ path: fullPath, content });
                } catch (err) {
                    console.error(`Error reading Markdown file ${fullPath}:`, err);
                    // Optionally, decide if one error should stop the whole process
                }
            }
        }
        return allDocs;
    } catch (err) {
        console.error(`Error reading documentation directory ${dirPath}:`, err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    loadDocumentation,
};