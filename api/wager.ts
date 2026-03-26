export default async function handler(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const escrow = searchParams.get("escrow");

    if (!escrow) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://predex-22ce1-default-rtdb.firebaseio.com/wagers/${escrow}.json`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data || null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify(null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}