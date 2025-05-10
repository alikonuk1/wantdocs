#!/usr/bin/env node
// AI Documentation Synchronizer
// Main entry point

require('dotenv').config(); // Load environment variables from .env file

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require('path');
const fs = require('fs').promises;

const { loadCodebase } = require('./src/modules/codeLoader');
const { loadDocumentation } = require('./src/modules/docLoader');
const { analyzeCodebase } = require('./src/modules/codeAnalyzer');
const { analyzeDocumentation } = require('./src/modules/docAnalyzer');
const { performComparisons } = require('./src/modules/comparisonEngine');
const { generateDocUpdates } = require('./src/modules/updateGenerator');

async function main() {
    const argv = yargs(hideBin(process.argv))
        .option('codePath', {
            alias: 'c',
            type: 'string',
            description: 'Path to the codebase directory',
            demandOption: true,
        })
        .option('docPath', {
            alias: 'd',
            type: 'string',
            description: 'Path to the documentation directory',
            demandOption: true,
        })
        .option('outputDir', {
            alias: 'o',
            type: 'string',
            description: 'Directory to save updated documentation files (optional)',
        })
        .help()
        .alias('help', 'h')
        .argv;

    console.log("AI Documentation Synchronizer starting...");
    console.log(`Codebase path: ${argv.codePath}`);
    console.log(`Documentation path: ${argv.docPath}`);
    if (argv.outputDir) {
        console.log(`Output directory for updates: ${argv.outputDir}`);
    }
    console.log("---");

    try {
        // 1. Load code and documentation
        console.log("\nLoading codebase...");
        const codeFiles = await loadCodebase(argv.codePath);
        if (codeFiles.length === 0) {
            console.log("No code files found. Exiting.");
            return;
        }
        console.log(`Loaded ${codeFiles.length} code file(s).`);

        console.log("\nLoading documentation...");
        const docFiles = await loadDocumentation(argv.docPath);
        if (docFiles.length === 0) {
            console.log("No documentation files found. Exiting.");
            return;
        }
        console.log(`Loaded ${docFiles.length} documentation file(s).`);
        console.log("---");

        // 2. Analyze code and documentation
        console.log("\nAnalyzing codebase (this may take a while)...");
        const codeAnalyses = await analyzeCodebase(codeFiles);
        console.log("Codebase analysis complete.");

        console.log("\nAnalyzing documentation (this may take a while)...");
        const docAnalyses = await analyzeDocumentation(docFiles);
        console.log("Documentation analysis complete.");
        console.log("---");

        // 3. Compare analyses
        // Note: performComparisons currently uses a basic strategy (e.g., first code vs first doc).
        // This will need refinement for more complex scenarios.
        console.log("\nPerforming comparison (this may take a while)...");
        const comparisonResults = await performComparisons(codeAnalyses, docAnalyses);
        console.log("Comparison complete.");
        console.log("---");

        if (comparisonResults.length === 0 || !comparisonResults[0].comparison) {
            console.log("\nNo comparison results generated or comparison failed. Cannot generate updates.");
            return;
        }
        
        // For now, we'll focus on updating the first document based on the first comparison.
        const firstComparison = comparisonResults[0];
        const targetDocPath = firstComparison.docFile;
        const originalDocToUpdate = docFiles.find(df => df.path === targetDocPath);
        const relevantCodeAnalysis = codeAnalyses.find(ca => ca.path === firstComparison.codeFile);

        if (!originalDocToUpdate) {
            console.error(`\nCould not find original document content for ${targetDocPath}. Cannot generate updates.`);
            return;
        }

        console.log(`\nGenerating updates for ${targetDocPath} (this may take a while)...`);
        const updatedDocContent = await generateDocUpdates(
            firstComparison.comparison,
            originalDocToUpdate.content,
            originalDocToUpdate.path,
            relevantCodeAnalysis ? relevantCodeAnalysis.analysis : ""
        );
        console.log("---");

        if (updatedDocContent) {
            console.log(`\nSuggested updates for: ${targetDocPath}`);
            console.log("================================================");
            console.log(updatedDocContent);
            console.log("================================================");

            if (argv.outputDir) {
                try {
                    await fs.mkdir(argv.outputDir, { recursive: true });
                    const outputFilePath = path.join(argv.outputDir, path.basename(targetDocPath));
                    await fs.writeFile(outputFilePath, updatedDocContent, 'utf-8');
                    console.log(`\nUpdated documentation saved to: ${outputFilePath}`);
                } catch (err) {
                    console.error(`\nError saving updated documentation to ${argv.outputDir}:`, err);
                }
            } else {
                console.log("\nTo save the output, provide an --outputDir option.");
            }
        } else {
            console.log(`\nNo updates generated for ${targetDocPath}, or generation failed.`);
        }

    } catch (error) {
        console.error("\nAn error occurred during the synchronization process:", error);
    } finally {
        console.log("\nAI Documentation Synchronizer finished.");
    }
}

main().catch(error => {
    console.error("Unhandled error in main function:", error);
    process.exit(1);
});
