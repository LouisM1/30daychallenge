document.getElementById('generateBtn').addEventListener('click', async () => {
    const response = await fetch('/generate-quote');
    const data = await response.json();
    document.getElementById('quoteDisplay').textContent = `"${data.quote}" - ${data.celebrity}`;
});