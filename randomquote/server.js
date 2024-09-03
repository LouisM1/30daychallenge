const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const port = 3000;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.static('public'));

app.get('/generate-quote', async (req, res) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is missing');
        }

        console.log('API Key:', process.env.OPENAI_API_KEY); // Log the API key (be careful with this in production)
        console.log('Starting OpenAI API request');
        
        const completion = await openai.createCompletion({
            model: "text-davinci-003", // Updated to a more recent model
            prompt: "Generate a silly quote and attribute it to a random celebrity:",
            max_tokens: 50,
            n: 1,
            stop: null,
            temperature: 0.8,
        });

        console.log('OpenAI API Response:', JSON.stringify(completion.data, null, 2));

        if (!completion.data.choices || completion.data.choices.length === 0) {
            throw new Error('No choices returned from OpenAI API');
        }

        const fullText = completion.data.choices[0].text.trim();
        console.log('Full Text:', fullText);

        const lastDashIndex = fullText.lastIndexOf('-');
        console.log('Last Dash Index:', lastDashIndex);

        if (lastDashIndex === -1) {
            throw new Error('Unexpected response format from OpenAI API');
        }

        const quote = fullText.substring(0, lastDashIndex).trim();
        const celebrity = fullText.substring(lastDashIndex + 1).trim();

        console.log('Quote:', quote);
        console.log('Celebrity:', celebrity);

        res.json({ quote, celebrity });
    } catch (error) {
        console.error('Error details:', error);
        if (error.response) {
            console.error('OpenAI API error response:', error.response.data);
        }
        res.status(500).json({ error: 'An error occurred while generating the quote.', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});