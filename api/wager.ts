export const runtime = "edge";

export default async function handler(req: Request) {
  const url = new URL(req.url);

  // extract id from path
  const id = url.pathname.split("/").pop();

  if (!id) {
    return new Response("Missing wager id", { status: 400 });
  }

  /* =========================================
     🔥 USE YOUR REAL DOMAIN HERE
  ========================================= */
  const domain = "https://www.predexlabs.com";

  const ogImage = `${domain}/api/og?escrow=${id}`;
  const redirectUrl = `${domain}/wager/${id}`;

  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="PreDEX Wager" />
        <meta property="og:description" content="You've been invited to a wager" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${redirectUrl}" />
        <meta name="twitter:card" content="summary_large_image" />

        <script>
          window.location.href = "${redirectUrl}";
        </script>
      </head>

      <body style="background:black;color:white;display:flex;align-items:center;justify-content:center;height:100vh;">
        Loading wager...
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}