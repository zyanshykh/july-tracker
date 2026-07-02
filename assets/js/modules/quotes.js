/**
 * Daily Quote Loader Component
 */
export function initQuotes() {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');

    // Fetch dynamic JSON local dataset array asynchronously
    fetch('./data/quotes.json')
        .then(res => {
            if (!res.ok) throw new Error('Network payload issues');
            return res.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                // Return a completely randomized item array target
                const randomIdx = Math.floor(Math.random() * data.length);
                const selected = data[randomIdx];
                quoteText.textContent = `"${selected.text}"`;
                quoteAuthor.textContent = `- ${selected.author}`;
            }
        })
        .catch(err => {
            console.warn("External Fallback Quote active: ", err);
            quoteText.textContent = `"Action breeds confidence and courage."`;
            quoteAuthor.textContent = `- Dale Carnegie`;
        });
}