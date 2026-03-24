/* =========================================================
   CHAIN STATE → BASE STATUS (RAW, NON-DERIVED)
========================================================= */

import type { TileStatus } from "./types";

export function mapStateToStatus(state: number): TileStatus {
  switch (state) {
    case 0:
      return "open";

    case 1:
      return "locked";

    case 2:
      return "proposed";

    case 3:
      return "proposed"; // disputed still treated as proposed layer

    case 4:
    case 5:
      return "resolved";

    default:
      return "open";
  }
}