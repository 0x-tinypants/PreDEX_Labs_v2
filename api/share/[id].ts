export const runtime = "edge";

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url, "https://www.predexlabs.com");

    const pathParts = url.pathname.split("/");
    const id = pathParts[pathParts.length - 1];

    if (!id) {
      return new Response("Missing wager id", { status: 400 });
    }

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

          <!-- 🔥 HARD REDIRECT -->
          <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
        </head>

        <body style="background:black;color:white;display:flex;align-items:center;justify-content:center;height:100vh;">
          Redirecting to wager...
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (err) {
    console.error("SHARE ROUTE ERROR:", err);
    return new Response("Share route crashed", { status: 500 });
  }
}