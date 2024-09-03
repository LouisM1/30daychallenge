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
        const completion = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: "Generate a silly quote and attribute it to a random celebrity:",
            max_tokens: 50,
            n: 1,
            stop: null,
            temperature: 0.8,
        });

        const [quote, celebrity] = completion.data.choices[0].text.split(' - ');
        res.json({ quote: quote.trim(), celebrity: celebrity.trim() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while generating the quote.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});