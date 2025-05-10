require('dotenv').config();
const OpenAI = require('openai');

console.log('Environment loaded:', {
    provider: process.env.OPENROUTER_API_KEY ? 'openrouter' : (process.env.OPENAI_API_KEY ? 'openai' : 'none'),
    hasHttpReferer: !!process.env.HTTP_REFERER,
    hasXTitle: !!process.env.X_TITLE,
    modelForAnalysis: process.env.CODE_ANALYSIS_MODEL || 'default'
});

let llmClient;
const provider = process.env.OPENROUTER_API_KEY ? 'openrouter' : (process.env.OPENAI_API_KEY ? 'openai' : null);

if (provider === 'openrouter') {
    const siteUrl = process.env.HTTP_REFERER || 'http://localhost:3000'; // Default or user-defined
    const appName = process.env.X_TITLE || 'wantdocs'; // Default or user-defined
    try {
        llmClient = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": siteUrl,
                "X-Title": appName,
            },
        });
        console.log("Initialized LLM client for OpenRouter.");
    } catch (error) {
        console.error("Failed to initialize OpenRouter client. Ensure OPENROUTER_API_KEY, HTTP_REFERER, and X_TITLE are set.", error);
    }
} else if (provider === 'openai') {
    try {
        llmClient = new OpenAI(); // Automatically picks up OPENAI_API_KEY
        console.log("Initialized LLM client for OpenAI.");
    } catch (error) {
        console.error("Failed to initialize OpenAI client. Ensure OPENAI_API_KEY is set.", error);
    }
} else {
    console.error("No LLM API key found. Please set either OPENAI_API_KEY or OPENROUTER_API_KEY in your .env file.");
}

/**
 * Sends a prompt to the configured LLM and returns the completion.
 * @param {string} promptContent - The content of the prompt to send to the model.
 * @param {string} model - The model to use (e.g., "gpt-3.5-turbo", "openrouter/anthropic/claude-3-haiku").
 * @param {string} systemMessageContent - Optional system message to guide the AI's behavior.
 * @returns {Promise<string|null>} - A promise that resolves to the AI's response text, or null if an error occurs.
 */
async function getLLMCompletion(promptContent, model = "gpt-3.5-turbo", systemMessageContent = "You are a helpful assistant.") {
    if (!llmClient) {
        console.error("LLM client is not initialized. Cannot make API calls.");
        return null;
    }

    try {
        const messages = [{ role: "system", content: systemMessageContent }];
        messages.push({ role: "user", content: promptContent });

        // For OpenRouter, the model parameter might include the provider, e.g., "openrouter/anthropic/claude-3-haiku"
        // The OpenAI client library should handle this correctly if the baseURL is set to OpenRouter.
        const completion = await llmClient.chat.completions.create({
            model: model,
            messages: messages,
        });

        console.log(`Received response from ${provider}:`, JSON.stringify(completion, null, 2));
        
        if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
            return completion.choices[0].message.content.trim();
        } else {
            console.error(`Invalid response structure from ${provider} API. Full response:`, JSON.stringify(completion, null, 2));
            return null;
        }
    } catch (error) {
        console.error(`Error calling ${provider} API:`, error);
        if (error.response) {
            console.error(`${provider} API Error Response:`, {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            });
        }
        return null;
    }
}

module.exports = {
    getLLMCompletion,
    provider, // Export the determined provider
};
