import { useMemo } from "react";
import { qrMatrix } from "../lib/qrcode.js";

export default function QrCode({ value, size = 160, className = "" }) {
  const matrix = useMemo(() => {
    try {
      return qrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center border border-hairline-strong bg-surface p-3 text-center ${className}`}
      >
        <span className="break-all text-[0.625rem] leading-relaxed text-faint">
          {value}
        </span>
      </div>
    );
  }

  const quiet = 4;
  const dim = matrix.length + quiet * 2;
  let path = "";
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix.length; x++) {
      if (matrix[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`QR code for ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={dim} height={dim} fill="#eef3f9" />
      <path d={path} fill="#04060a" />
    </svg>
  );
}
