const { getOpenAICompletion } = require('./llmService');

/**
 * Analyzes a single piece of code using the LLM.
 * @param {string} codeContent - The code content to analyze.
 * @param {string} filePath - The path of the file being analyzed (for context in prompts).
 * @returns {Promise<string|null>} - A promise that resolves to the AI's analysis, or null.
 */
async function analyzeSingleCodeFile(codeContent, filePath) {
    // TODO: Develop more sophisticated prompts. Consider including file path or other metadata.
    // TODO: Consider chunking for very large files if they exceed token limits.
    const prompt = `
Analyze the following JavaScript code from the file "${filePath}".
Provide a concise summary of its main purpose, key functions or classes, their inputs, and outputs.
Identify any potential areas for improvement or concern if obvious.

Code:
\`\`\`javascript
${codeContent}
\`\`\`

Analysis:
`;
    // Using a model that's good for code analysis, like gpt-4 if available,
    // but defaulting to gpt-3.5-turbo for broader accessibility.
    // You might want to make the model configurable.
    return getOpenAICompletion(prompt, "gpt-3.5-turbo", "You are an expert code analysis assistant.");
}

/**
 * Analyzes a collection of code files.
 * @param {Array<{path: string, content: string}>} codeFiles - An array of code file objects.
 * @returns {Promise<Array<{path: string, analysis: string|null}>>} - A promise that resolves to an array
 *                                                                    of objects containing the file path
 *                                                                    and its analysis.
 */
async function analyzeCodebase(codeFiles) {
    const analyses = [];
    for (const file of codeFiles) {
        console.log(`Analyzing code file: ${file.path}...`);
        try {
            const analysis = await analyzeSingleCodeFile(file.content, file.path);
            analyses.push({ path: file.path, analysis });
            if (!analysis) {
                console.warn(`Analysis returned null for ${file.path}. Check LLM service logs.`);
            }
        } catch (error) {
            console.error(`Error analyzing file ${file.path}:`, error);
            analyses.push({ path: file.path, analysis: `Error during analysis: ${error.message}` });
        }
    }
    return analyses;
}

module.exports = {
    analyzeCodebase,
    analyzeSingleCodeFile,
};

// Example Usage (for testing - ensure OPENAI_API_KEY is set):
// const { loadCodebase } = require('./codeLoader'); // Assuming codeLoader is in the same directory
// const path = require('path');
//
// (async () => {
//     try {
//         // Example: Load the codeLoader.js file itself for analysis
//         const codebasePath = path.join(__dirname, '.'); // current directory
//         const filesToAnalyze = await loadCodebase(codebasePath);
//
//         if (filesToAnalyze.length > 0) {
//             console.log(`\nStarting analysis of ${filesToAnalyze.length} file(s)...`);
//             const analyses = await analyzeCodebase(filesToAnalyze.filter(f => f.path.endsWith('codeLoader.js'))); // Analyze only one file for quick test
//             analyses.forEach(result => {
//                 console.log(`\nAnalysis for: ${result.path}`);
//                 console.log(result.analysis || "No analysis content received.");
//             });
//         } else {
//             console.log("No code files found to analyze.");
//         }
//     } catch (error) {
//         console.error('Failed to analyze codebase:', error);
//     }
// })();
