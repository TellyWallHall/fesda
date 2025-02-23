const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const content = await response.text();
    const proxiedContent = content
      .replace(/href="(.*?)"/g, (match, url) => `href="/api/proxy?url=${encodeURIComponent(new URL(url, targetUrl).href)}"`)
      .replace(/src="(.*?)"/g, (match, url) => `src="/api/proxy?url=${encodeURIComponent(new URL(url, targetUrl).href})"`);

    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');
    res.send(proxiedContent);
  } catch (error) {
    res.status(500).send(`Error fetching URL: ${error.message}`);
  }
};
