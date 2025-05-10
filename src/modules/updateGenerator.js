const { getLLMCompletion, provider } = require('./llmService');

/**
 * Generates updated documentation content based on a comparison report.
 * @param {string} comparisonReport - The report detailing discrepancies between code and docs.
 * @param {string} originalDocContent - The original content of the documentation file to be updated.
 * @param {string} docFilePath - The path of the documentation file (for context).
 * @param {string} codeAnalysis - Optional: The analysis of the corresponding code (for more context).
 * @returns {Promise<string|null>} - A promise that resolves to the suggested updated documentation content, or null.
 */
async function generateDocUpdates(comparisonReport, originalDocContent, docFilePath, codeAnalysis = "") {
    // TODO: Develop a more sophisticated prompt.
    // The prompt should instruct the LLM to:
    // - Use the comparison report to understand what needs changing.
    // - Refer to the original documentation content to make targeted updates.
    // - Potentially use the code analysis for more direct information if needed.
    // - Output the *complete* updated Markdown content for the file.
    let prompt = `
You are an expert technical writer tasked with updating documentation to match the codebase.
You will be given a comparison report highlighting discrepancies, the original documentation content,
and the path of the documentation file. Optionally, you might receive a summary of the relevant code.

Documentation File Path: "${docFilePath}"

Comparison Report:
---
${comparisonReport}
---
`;

    if (codeAnalysis) {
        prompt += `
Relevant Code Analysis Summary (for additional context):
---
${codeAnalysis}
---
`;
    }

    prompt += `
Original Documentation Content:
\`\`\`markdown
${originalDocContent}
\`\`\`

Based on ALL the information above (especially the comparison report and original documentation), please rewrite and provide the COMPLETE updated Markdown content for the file "${docFilePath}".
Ensure your output is only the raw, updated Markdown content. Do not add any explanatory text before or after the Markdown.
If the documentation is largely correct and only minor changes are needed, make those changes.
If significant sections are missing, add them.
If sections are outdated, update or remove them as appropriate.
Strive for accuracy, clarity, and completeness in the updated documentation.

Updated Markdown Content:
`;

    // This task is complex and might benefit from a more capable model (e.g., gpt-4).
    // It also requires careful prompt engineering.
    const defaultOpenAIModel = "gpt-3.5-turbo";
    const defaultOpenRouterModel = "qwen/qwen3-235b-a22b:free";

    let modelToUse = process.env.UPDATE_GENERATOR_MODEL;
    if (!modelToUse) {
        modelToUse = provider === 'openrouter' ? defaultOpenRouterModel : defaultOpenAIModel;
    }
    
    return getLLMCompletion(prompt, modelToUse, "You are an expert technical writing assistant specializing in updating documentation.");
}

module.exports = {
    generateDocUpdates,
};

// Example Usage (for testing - ensure OPENAI_API_KEY is set):
// (async () => {
//     const sampleComparisonReport = `
// Comparison Report:
// 1. Key elements from the code analysis that ARE well-covered in the documentation analysis:
//    - Function \`calculateSum\` is documented.
// 2. Key elements from the code analysis that seem to be MISSING or INADEQUATELY covered in the documentation analysis:
//    - Class \`DataProcessor\` and its method \`process\` are not mentioned in the documentation.
// 3. Information in the documentation analysis that appears OUTDATED or CONTRADICTORY to the code analysis:
//    - None noted.
// 4. Any other notable discrepancies or areas for improvement in the documentation:
//    - The documentation could benefit from an example usage of \`calculateSum\`.
// `;
//     const sampleOriginalDoc = `
// # Example Module
//
// This module provides utility functions.
//
// ## calculateSum
//
// Takes two numbers and returns their sum.
// `;
//     const sampleDocPath = "docs/example.md";
//     const sampleCodeAnalysis = "The code includes a class `DataProcessor` with a method `process(data)` that transforms input data.";
//
//     console.log("Generating sample documentation update...");
//     const updatedDoc = await generateDocUpdates(sampleComparisonReport, sampleOriginalDoc, sampleDocPath, sampleCodeAnalysis);
//
//     if (updatedDoc) {
//         console.log(`\nSuggested Update for ${sampleDocPath}:`);
//         console.log(updatedDoc);
//     } else {
//         console.log("Failed to generate documentation update.");
//     }
// })();
