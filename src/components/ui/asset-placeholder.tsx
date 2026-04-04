import Image from "next/image";

// ─── Asset Placeholder ─────────────────────────────────────
// Drop-in component for illustration/image slots throughout the app.
// Designed for zero-hassle asset replacement:
//
//   1. Before assets are ready: renders nothing (invisible)
//   2. When asset is ready: just set the `src` prop → image renders
//
// No other code changes needed when adding real assets.
//
// Usage:
//   <AssetPlaceholder width={200} height={200} />                    ← invisible slot
//   <AssetPlaceholder src="/images/checkin-hero.png" alt="Hero" />   ← real asset

interface AssetPlaceholderProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AssetPlaceholder({
  src,
  alt = "",
  width = 200,
  height = 200,
  className = "",
}: AssetPlaceholderProps) {
  // No src → render nothing. The layout space is not reserved,
  // so the surrounding content flows naturally whether or not
  // an asset is provided. When you add the src later, the image
  // appears and the layout adjusts.
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
