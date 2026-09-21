import Image from "next/image";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/** Circular brand mark from the official lockup (forest green + warm blush). */
export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`.trim()}
      priority
    />
  );
}
