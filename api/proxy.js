const fetch = require('node-fetch');
const { URL } = require('url');

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

        // Handle OPTIONS requests
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Validate URL parameter
        const targetUrl = req.query.url;
        if (!targetUrl) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        // Parse and validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid URL' });
        }

        // Fetch target content
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        // Get content type
        const contentType = response.headers.get('content-type') || 'text/html';
        res.setHeader('Content-Type', contentType);

        // Handle HTML content
        if (contentType.includes('text/html')) {
            const content = await response.text();
            const proxyBase = `${req.headers['x-forwarded-proto']}://${req.headers['host']}/api/proxy?url=`;

            // Rewrite URLs
            const processed = content
                .replace(/(href|src|action)=["'](.*?)["']/gi, (_, attr, value) => {
                    try {
                        const resolved = new URL(value, targetUrl).href;
                        return `${attr}="${proxyBase}${encodeURIComponent(resolved)}"`;
                    } catch {
                        return `${attr}="${value}"`;
                    }
                });

            return res.send(processed);
        }

        // Handle other content types (images, CSS, etc.)
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (error) {
        // Ensure CORS headers are set for errors
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};
