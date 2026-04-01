type Props = {
  onCreateClick: () => void;
};

export default function ControlBar({ onCreateClick }: Props) {
  return (
    <div className="control-bar">

      {/* LEFT SLOT */}
      <button className="btn">
        LEFT
      </button>

      {/* CENTER (PRIMARY ACTION) */}
      <button
        className="btn btn-create"
        onClick={() => {
          onCreateClick();
        }}
      >
        + CREATE
      </button>

      {/* RIGHT SLOT */}
      <button className="btn">
        RIGHT
      </button>

    </div>
  );
}