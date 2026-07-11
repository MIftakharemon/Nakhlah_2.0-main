
export function DottedLine() {
  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="#d1d5db"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
