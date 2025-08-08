import { quotes } from '../data/quotes.js';

export async function onRequest(context) {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  return new Response(JSON.stringify({ quote: randomQuote }), {
    headers: { 'Content-Type': 'application/json' },
  });
}