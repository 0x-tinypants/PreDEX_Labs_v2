import logo from "../assets/logo.png";

type Props = {
  address?: string;
  onConnect: () => void;
};

export default function Header({ address, onConnect }: Props) {
  const short = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="header">
      {/* LEFT: BRAND */}
      <div className="header-left">
        <img src={logo} alt="logo" className="logo" />
        <span className="brand">PreDEX Labs</span>
      </div>

      {/* RIGHT: WALLET */}
      <div className="header-right">
        <button onClick={onConnect} className="btn-connect">
          {address ? `🟢 ${short(address)}` : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}