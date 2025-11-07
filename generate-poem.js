netlify/functions/generate-poem.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { theme, style = 'თავისუფალი', lines = '8', language = 'ქართული' } = JSON.parse(event.body);

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key missing on server' })
    };
  }

  const prompt = `შექმენი ლექსი ქართულად თემაზე: "${theme}". სტილი: ${style}. სტრიქონები: ${lines}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0].text) {
      return {
        statusCode: 200,
        body: JSON.stringify({ poem: data.content[0].text })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No poem generated', raw: data })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
