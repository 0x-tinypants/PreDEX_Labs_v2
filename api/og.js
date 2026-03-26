export default async function handler(req, res) {
  try {
    const escrow = req.query.escrow;

    const response = await fetch(
      "https://predex-22ce1-default-rtdb.firebaseio.com/wagers.json"
    );

    const raw = await response.json();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    let wager = null;

    if (data && typeof data === "object") {
      if (escrow && data[escrow]) {
        wager = data[escrow];
      } else {
        const firstKey = Object.keys(data)[0];
        wager = data[firstKey];
      }
    }

    if (!wager) {
      return res.status(200).send(`
        <html>
          <body style="background:black;color:#d9ff00;display:flex;align-items:center;justify-content:center;height:100vh;font-size:48px;">
            PreDEX Wager
          </body>
        </html>
      `);
    }

    const creator = wager.creator || "Unknown";
    const opponent = wager.opponent || "Open";
    const amount = Number(wager.amount || 0);
    const pot = wager.opponent ? amount * 2 : amount;
    const statement = wager.statement || "No statement provided";
    const status = wager.opponent ? "LOCKED" : "OPEN";

    return res.status(200).send(`
      <html>
        <body style="background:black;color:white;padding:60px;font-family:sans-serif;">
          <h1>${creator} vs ${opponent}</h1>
          <p>${statement}</p>
          <div style="display:flex;justify-content:space-between;">
            <span>Pot: $${pot}</span>
            <span>${status}</span>
          </div>
        </body>
      </html>
    `);
  } catch {
    return res.status(200).send(`
      <html>
        <body style="background:black;color:#d9ff00;display:flex;align-items:center;justify-content:center;height:100vh;font-size:48px;">
          PreDEX Wager
        </body>
      </html>
    `);
  }
}