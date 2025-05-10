const OpenAI = require('openai');

// Initialize OpenAI client
// It will automatically look for the OPENAI_API_KEY environment variable.
let openai;
try {
    openai = new OpenAI();
} catch (error) {
    console.error("Failed to initialize OpenAI client. Ensure OPENAI_API_KEY is set.", error);
    // Depending on desired behavior, you might want to throw the error or handle it differently
    // For now, we'll let it proceed, but API calls will fail.
}

/**
 * Sends a prompt to the specified OpenAI model and returns the completion.
 * @param {string} promptContent - The content of the prompt to send to the model.
 * @param {string} model - The OpenAI model to use (e.g., "gpt-3.5-turbo", "gpt-4").
 * @param {string} systemMessageContent - Optional system message to guide the AI's behavior.
 * @returns {Promise<string|null>} - A promise that resolves to the AI's response text, or null if an error occurs.
 */
async function getOpenAICompletion(promptContent, model = "gpt-3.5-turbo", systemMessageContent = "You are a helpful assistant.") {
    if (!openai) {
        console.error("OpenAI client is not initialized. Cannot make API calls.");
        return null;
    }

    try {
        const messages = [{ role: "system", content: systemMessageContent }];
        messages.push({ role: "user", content: promptContent });

        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
        });

        if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
            return completion.choices[0].message.content.trim();
        } else {
            console.error("Invalid response structure from OpenAI API:", completion);
            return null;
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error.message);
        if (error.response) {
            console.error("OpenAI API Error Response Data:", error.response.data);
            console.error("OpenAI API Error Response Status:", error.response.status);
        }
        return null;
    }
}

module.exports = {
    getOpenAICompletion,
};

// Example Usage (for testing - ensure OPENAI_API_KEY is set in your environment):
// (async () => {
//     const prompt = "Explain the concept of a promise in JavaScript in simple terms.";
//     console.log(`Sending prompt to OpenAI: "${prompt}"`);
//     const response = await getOpenAICompletion(prompt, "gpt-3.5-turbo");
//
//     if (response) {
//         console.log("\nOpenAI Response:");
//         console.log(response);
//     } else {
//         console.log("\nFailed to get response from OpenAI.");
//     }
// })();
