export async function getWagerForOG(escrowAddress: string) {
  // TEMP MOCK DATA (to verify OG pipeline works)

  return {
    escrowAddress,
    statement: "test test test for the logs",
    creator: "0xe71d...561f",
    opponent: "0xa876...304b",
    stake: 0.001,
    pot: 0.002,
    status: "OPEN",
  };
}