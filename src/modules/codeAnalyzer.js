const { getLLMCompletion, provider } = require('./llmService');

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
    const defaultOpenAIModel = "gpt-3.5-turbo";
    const defaultOpenRouterModel = "qwen/qwen3-235b-a22b:free";
    
    let modelToUse = process.env.CODE_ANALYSIS_MODEL;
    if (!modelToUse) {
        modelToUse = provider === 'openrouter' ? defaultOpenRouterModel : defaultOpenAIModel;
    }

    return getLLMCompletion(prompt, modelToUse, "You are an expert code analysis assistant.");
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