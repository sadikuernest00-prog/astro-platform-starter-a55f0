
import React, { useState } from "react";
import { BrowserProvider } from "ethers";

type Status = "idle" | "connecting" | "signing" | "verifying" | "success" | "error";

const VerifyWallet: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  async function handleVerify() {
    setError(null);
    setStatus("connecting");

    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        throw new Error("No wallet detected. Install MetaMask or use a Web3 wallet.");
      }

      const provider = new BrowserProvider(eth);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts?.length) {
        throw new Error("Could not access wallet accounts.");
      }

      const address = accounts[0];
      setWalletAddress(address);

      setStatus("signing");

      const message = `Amicbridge Wallet Verification\nAddress: ${address}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      setStatus("verifying");

      const res = await fetch("/api/verify-wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature })
      });

      const data = await res.json();
      if (!data.valid) {
        throw new Error("Signature could not be verified.");
      }

      setVerified(true);
      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Verify your wallet</h2>

      <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
        You’ll sign a safe, free message to prove control of your wallet.
        No blockchain transaction. No fees.
      </p>

      {!verified && (
        <button
          onClick={handleVerify}
          disabled={status === "connecting" || status === "signing" || status === "verifying"}
          style={{
            background: "#22c55e",
            color: "#022c22",
            fontWeight: 600,
            borderRadius: "8px",
            padding: "0.6rem 1rem",
            border: "none",
            cursor: "pointer",
            width: "100%",
            marginBottom: "1rem",
            opacity: status !== "idle" ? 0.85 : 1
          }}
        >
          {status === "idle" && "Verify Wallet"}
          {status === "connecting" && "Connecting…"}
          {status === "signing" && "Waiting for signature…"}
          {status === "verifying" && "Verifying…"}
        </button>
      )}

      {verified && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            background: "rgba(34,197,94,0.15)",
            color: "#22c55e",
            marginTop: "1rem",
            border: "1px solid rgba(34,197,94,0.4)"
          }}
        >
          <strong>Wallet verified:</strong> {walletAddress}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            background: "rgba(239,68,68,0.15)",
            color: "#ef4444",
            marginTop: "1rem",
            border: "1px solid rgba(239,68,68,0.4)"
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default VerifyWallet;
