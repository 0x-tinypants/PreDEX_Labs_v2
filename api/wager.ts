export const runtime = "edge";

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const escrow = searchParams.get("escrow") || "";

  const ogImage = `https://your-domain.vercel.app/api/og?escrow=${escrow}`;

  return new Response(
    `
    <html>
      <head>
        <meta property="og:title" content="PreDEX Wager" />
        <meta property="og:description" content="You've been invited to a wager" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        <script>
          window.location.href = "/wager/${escrow}";
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