import Image from "next/image";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/** Official mark: peach + mint figures (favicon / compact uses). */
export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-[20%] object-cover ${className}`.trim()}
      priority
    />
  );
}
