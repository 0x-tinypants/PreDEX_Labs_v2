import { ethers } from "ethers";
// --- ENV ---
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.FUNDER_PRIVATE_KEY;
// --- PROVIDER + WALLET ---
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
// --- TEMP MEMORY STORE (replace with Firebase later) ---
const fundedWallets = new Set();
export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ error: "Missing address" });
        }
        // Normalize
        const normalized = address.toLowerCase();
        // 🚫 Already funded
        if (fundedWallets.has(normalized)) {
            return res.status(200).json({ status: "already funded" });
        }
        // 🔍 Check balance
        const balance = await provider.getBalance(normalized);
        if (balance > 0n) {
            fundedWallets.add(normalized);
            return res.status(200).json({ status: "already has funds" });
        }
        // 💸 Send 0.5 ETH
        const tx = await wallet.sendTransaction({
            to: normalized,
            value: ethers.parseEther("0.5"),
        });
        await tx.wait();
        // ✅ Mark funded
        fundedWallets.add(normalized);
        return res.status(200).json({
            status: "funded",
            txHash: tx.hash,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Funding failed" });
    }
}
