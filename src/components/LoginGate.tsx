import { useState } from "react";

type Props = {
  onGoogle: () => void;
  onMetaMask: () => void;
};

export default function LoginGate({ onGoogle, onMetaMask }: Props) {
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="login-gate">
      <div className="login-card retro">

        {/* HEADER */}
        <h2 className="login-title">⚡ You’ve Been Challenged</h2>
        <p className="login-sub">
          Someone invited you to a peer-to-peer wager on PreDEX.
        </p>

        {/* INFO BLOCK */}
        <div className="info-block">
          <p>
            PreDEX lets you create and accept wagers directly between players.
            No house. No odds. Just skill.
          </p>
        </div>

        {/* FAQ / ACCORDION */}
        <div className="faq">

          <div className="faq-item" onClick={() => toggle(0)}>
            <div className="faq-question">What is this?</div>
            {openIndex === 0 && (
              <div className="faq-answer">
                A direct challenge between two players. Funds are locked in escrow
                and released based on the result.
              </div>
            )}
          </div>

          <div className="faq-item" onClick={() => toggle(1)}>
            <div className="faq-question">Is this safe?</div>
            {openIndex === 1 && (
              <div className="faq-answer">
                Yes. Funds are held in a smart contract escrow. Neither player
                can access them until the outcome is confirmed.
              </div>
            )}
          </div>

          <div className="faq-item" onClick={() => toggle(2)}>
            <div className="faq-question">Do I need crypto?</div>
            {openIndex === 2 && (
              <div className="faq-answer">
                Not necessarily. Logging in with Google creates a wallet for you automatically.
              </div>
            )}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="login-actions">

          <button
            className="btn primary"
            onClick={async () => {
              setLoading(true);
              await onGoogle();
            }}
          >
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <button
            className="btn secondary"
            onClick={onMetaMask}
          >
            Continue with MetaMask
          </button>

        </div>

      </div>
    </div>
  );
}