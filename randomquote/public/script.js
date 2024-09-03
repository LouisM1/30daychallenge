document.getElementById('generateBtn').addEventListener('click', async () => {
    try {
        console.log('Button clicked, starting fetch request');
        const response = await fetch('/generate-quote');
        console.log('Fetch response:', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        document.getElementById('quoteDisplay').textContent = `"${data.quote}" - ${data.celebrity}`;
    } catch (error) {
        console.error('Error in script.js:', error);
        document.getElementById('quoteDisplay').textContent = 'An error occurred while generating the quote.';
    }
});