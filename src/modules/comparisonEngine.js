const { getOpenAICompletion } = require('./llmService');

/**
 * Compares a single code analysis with a single documentation analysis using an LLM.
 * @param {string} codeAnalysis - The analysis text of a code file.
 * @param {string} docAnalysis - The analysis text of a documentation file.
 * @param {string} codeFilePath - Path of the code file (for context).
 * @param {string} docFilePath - Path of the doc file (for context).
 * @returns {Promise<string|null>} - A promise that resolves to the LLM's comparison result, or null.
 */
async function compareAnalyses(codeAnalysis, docAnalysis, codeFilePath, docFilePath) {
    // TODO: Develop a more sophisticated prompt.
    // The prompt should guide the LLM to identify:
    // - What code elements are documented?
    // - Is the documentation accurate based on the code analysis?
    // - What's missing from the documentation?
    // - What's in the documentation but not reflected in the code (or seems outdated)?
    const prompt = `
You are an expert at comparing software code analysis with documentation analysis.
Your task is to identify discrepancies, outdated information, and missing content.

Code File Path: "${codeFilePath}"
Code Analysis Summary:
---
${codeAnalysis}
---

Documentation File Path: "${docFilePath}"
Documentation Analysis Summary:
---
${docAnalysis}
---

Based on the two summaries above, please provide a detailed comparison. Highlight:
1.  Key elements from the code analysis that ARE well-covered in the documentation analysis.
2.  Key elements from the code analysis that seem to be MISSING or INADEQUATELY covered in the documentation analysis.
3.  Information in the documentation analysis that appears OUTDATED or CONTRADICTORY to the code analysis.
4.  Any other notable discrepancies or areas for improvement in the documentation.

Be specific and provide clear examples if possible.

Comparison Report:
`;

    // This task might benefit from a more capable model if available (e.g., gpt-4)
    return getOpenAICompletion(prompt, "gpt-3.5-turbo", "You are a meticulous comparison assistant.");
}

/**
 * Orchestrates the comparison of multiple code analyses against multiple document analyses.
 * This is a simplified initial approach: it might compare each code file analysis
 * against each document analysis, or require a more intelligent mapping strategy later.
 * For now, let's assume we are comparing a specific code analysis to a specific doc analysis,
 * or a set of code analyses to a general set of doc analyses.
 *
 * This function might need to be more sophisticated depending on how mappings are decided.
 * For a simple start, it could take one code analysis and one doc analysis.
 *
 * @param {Array<{path: string, analysis: string}>} allCodeAnalyses - Array of code analysis objects.
 * @param {Array<{path: string, analysis: string}>} allDocAnalyses - Array of doc analysis objects.
 * @returns {Promise<Array<{codeFile: string, docFile: string, comparison: string|null}>>} - Comparison results.
 */
async function performComparisons(allCodeAnalyses, allDocAnalyses) {
    const comparisonResults = [];

    // Basic strategy: Compare the first code analysis to the first doc analysis.
    // This is a placeholder for a more intelligent mapping logic.
    // In a real scenario, you'd need a way to decide which code analysis maps to which doc analysis.
    // Or, you might consolidate all code analyses and all doc analyses into larger summaries first.

    if (allCodeAnalyses.length > 0 && allDocAnalyses.length > 0) {
        // Example: Compare every code analysis to every doc analysis (can be verbose and costly)
        // For a more focused initial test, let's just compare the first of each if they exist.
        const codeAnalysisItem = allCodeAnalyses[0];
        const docAnalysisItem = allDocAnalyses[0];

        console.log(`Comparing code analysis for "${codeAnalysisItem.path}" with doc analysis for "${docAnalysisItem.path}"...`);
        if (codeAnalysisItem.analysis && docAnalysisItem.analysis) {
            try {
                const comparison = await compareAnalyses(
                    codeAnalysisItem.analysis,
                    docAnalysisItem.analysis,
                    codeAnalysisItem.path,
                    docAnalysisItem.path
                );
                comparisonResults.push({
                    codeFile: codeAnalysisItem.path,
                    docFile: docAnalysisItem.path,
                    comparison
                });
            } catch (error) {
                console.error(`Error during comparison for ${codeAnalysisItem.path} and ${docAnalysisItem.path}:`, error);
                comparisonResults.push({
                    codeFile: codeAnalysisItem.path,
                    docFile: docAnalysisItem.path,
                    comparison: `Error during comparison: ${error.message}`
                });
            }
        } else {
            console.warn(`Skipping comparison due to missing analysis content for ${codeAnalysisItem.path} or ${docAnalysisItem.path}`);
        }
    } else {
        console.warn("Not enough analyses to perform a comparison.");
    }

    return comparisonResults;
}

module.exports = {
    compareAnalyses,
    performComparisons,
};

// Example Usage (for testing - ensure OPENAI_API_KEY is set):
// (async () => {
//     const sampleCodeAnalysis = {
//         path: "src/example.js",
//         analysis: "This module contains a function `calculateSum` that takes two numbers and returns their sum. It also has a class `DataProcessor` with a method `process`."
//     };
//     const sampleDocAnalysis = {
//         path: "docs/example.md",
//         analysis: "This document describes the `calculateSum` function, explaining its parameters and return value. It does not mention `DataProcessor`."
//     };
//
//     console.log("Performing sample comparison...");
//     const results = await performComparisons([sampleCodeAnalysis], [sampleDocAnalysis]);
//
//     results.forEach(res => {
//         console.log(`\nComparison for Code: ${res.codeFile} and Doc: ${res.docFile}`);
//         console.log(res.comparison || "No comparison content received.");
//     });
// })();
