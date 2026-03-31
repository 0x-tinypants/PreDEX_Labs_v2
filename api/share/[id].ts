export default function handler(req: any, res: any) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send('Missing id');
  }

  const ogImage = `https://www.predexlabs.com/og-wager.png`;

  res.setHeader('Content-Type', 'text/html');

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <meta property="og:title" content="You've been challenged ⚡" />
        <meta property="og:description" content="Tap to accept the wager on PreDEX" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="You've been challenged ⚡" />
        <meta name="twitter:description" content="Tap to accept the wager on PreDEX" />
        <meta name="twitter:image" content="${ogImage}" />

        <script>
          window.location.href = "/?wager=${id}";
        </script>
      </head>
      <body style="background:black;color:white;">
        Redirecting...
      </body>
    </html>
  `);
}