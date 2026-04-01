import { ref, get, set, update } from "firebase/database";
import { db } from "./config";

/* =========================================
   👤 CREATE USER (ON FIRST LOGIN)
========================================= */
export async function createUserIfNotExists(user: {
  uid: string;
  email?: string;
}) {
  try {
    const userRef = ref(db, `users/${user.uid}`);

    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        uid: user.uid,
        email: user.email || null,
        walletAddress: null,
        balance: 1000, // 🔥 STARTER FUNDS (CHANGE LATER)
        createdAt: Date.now(),
      });

    } else {
    }
  } catch (err) {
    console.error("createUserIfNotExists error:", err);
  }
}

/* =========================================
   🔗 ATTACH WALLET TO USER
========================================= */
export async function attachWalletToUser(
  uid: string,
  walletAddress: string
) {
  try {
    const userRef = ref(db, `users/${uid}`);

    await update(userRef, {
      walletAddress,
    });

  } catch (err) {
  }
}

/* =========================================
   💰 GET USER DATA
========================================= */
export async function getUser(uid: string) {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.val();
  } catch (err) {
    console.error("getUser error:", err);
    return null;
  }
}

/* =========================================
   💸 UPDATE BALANCE
========================================= */
export async function updateBalance(
  uid: string,
  newBalance: number
) {
  try {
    const userRef = ref(db, `users/${uid}`);

    await update(userRef, {
      balance: newBalance,
    });

  } catch (err) {
  }
}