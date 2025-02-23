<!DOCTYPE html>
<html>
<head>
    <title>Vercel Proxy</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #nav { margin-bottom: 20px; }
        #urlInput { width: 300px; padding: 5px; }
        #content { border: 1px solid #ccc; padding: 10px; }
    </style>
</head>
<body>
    <div id="nav">
        <form onsubmit="loadUrl(event)">
            <input type="url" id="urlInput" placeholder="Enter URL (e.g., https://example.com)" required>
            <button type="submit">Go</button>
        </form>
    </div>
    <div id="content"></div>

    <script>
        async function loadUrl(e) {
            e.preventDefault();
            const url = document.getElementById('urlInput').value;
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
            history.pushState({}, '', `?url=${encodeURIComponent(url)}`);
            
            try {
                const response = await fetch(proxyUrl);
                const html = await response.text();
                document.getElementById('content').innerHTML = html;
            } catch (error) {
                document.getElementById('content').innerHTML = `Error loading page: ${error}`;
            }
        }

        // Initial load from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const initialUrl = urlParams.get('url');
        if (initialUrl) {
            document.getElementById('urlInput').value = initialUrl;
            loadUrl(new Event('init'));
        }
    </script>
</body>
</html>
