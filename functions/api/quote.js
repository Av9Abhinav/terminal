import { quotes } from '../data/quotes.js';

export async function onRequest(context) {
    try {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        return new Response(JSON.stringify({ quote: randomQuote }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
