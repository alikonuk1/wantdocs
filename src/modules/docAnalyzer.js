const { getOpenAICompletion } = require('./llmService');

/**
 * Analyzes a single Markdown documentation file using the LLM.
 * @param {string} docContent - The Markdown content to analyze.
 * @param {string} filePath - The path of the file being analyzed (for context).
 * @returns {Promise<string|null>} - A promise that resolves to the AI's analysis of the documentation, or null.
 */
async function analyzeSingleDocFile(docContent, filePath) {
    // TODO: Develop more sophisticated prompts.
    // Consider asking the LLM to identify key sections, topics covered, and any explicit links to code.
    const prompt = `
Analyze the following Markdown documentation from the file "${filePath}".
Provide a concise summary of its main topics, structure, and the information it intends to convey.
Identify any sections that seem to describe code components or functionalities.

Documentation Content:
\`\`\`markdown
${docContent}
\`\`\`

Analysis:
`;
    // Using a model that's good for text analysis.
    return getOpenAICompletion(prompt, "gpt-3.5-turbo", "You are an expert documentation analysis assistant.");
}

/**
 * Analyzes a collection of documentation files.
 * @param {Array<{path: string, content: string}>} docFiles - An array of documentation file objects.
 * @returns {Promise<Array<{path: string, analysis: string|null}>>} - A promise that resolves to an array
 *                                                                    of objects containing the file path
 *                                                                    and its analysis.
 */
async function analyzeDocumentation(docFiles) {
    const analyses = [];
    for (const file of docFiles) {
        console.log(`Analyzing documentation file: ${file.path}...`);
        try {
            const analysis = await analyzeSingleDocFile(file.content, file.path);
            analyses.push({ path: file.path, analysis });
            if (!analysis) {
                console.warn(`Documentation analysis returned null for ${file.path}. Check LLM service logs.`);
            }
        } catch (error) {
            console.error(`Error analyzing documentation file ${file.path}:`, error);
            analyses.push({ path: file.path, analysis: `Error during analysis: ${error.message}` });
        }
    }
    return analyses;
}

module.exports = {
    analyzeDocumentation,
    analyzeSingleDocFile,
};

// Example Usage (for testing - ensure OPENAI_API_KEY is set):
// const { loadDocumentation } = require('./docLoader'); // Assuming docLoader is in the same directory
// const path = require('path');
//
// (async () => {
//     try {
//         // Example: Load the progress.md file for analysis
//         const docsPath = path.join(__dirname, '../../memory-bank');
//         const filesToAnalyze = await loadDocumentation(docsPath);
//
//         if (filesToAnalyze.length > 0) {
//             console.log(`\nStarting analysis of ${filesToAnalyze.length} document(s)...`);
//             const analyses = await analyzeDocumentation(filesToAnalyze.filter(f => f.path.endsWith('progress.md'))); // Analyze one file
//             analyses.forEach(result => {
//                 console.log(`\nAnalysis for: ${result.path}`);
//                 console.log(result.analysis || "No analysis content received.");
//             });
//         } else {
//             console.log("No documentation files found to analyze.");
//         }
//     } catch (error) {
//         console.error('Failed to analyze documentation:', error);
//     }
// })();
