export type WagerIntent =
  | {
      type: "ACCEPT";
      escrowAddress: string;
      side: "yes" | "no";
      wagerType: "P2P" | "OPEN";
    }
  | {
      type: "RESOLVE_PROPOSE";
      escrowAddress: string;
      winner: string;
    }
  | {
      type: "RESOLVE_CLAIM"; // ✅ ADD THIS
      escrowAddress: string;
    };