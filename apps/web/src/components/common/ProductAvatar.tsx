
export interface ProductAvatarProps {
  name?: string;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_STYLES = {
  xs: "w-[24px] h-[24px] rounded-[4px] text-[11px]",
  sm: "w-[28px] h-[28px] rounded-[4px] text-[12px]",
  md: "w-[36px] h-[36px] rounded-[6px] text-[14px]", // Standard Products table avatar
  lg: "w-[44px] h-[44px] rounded-[6px] text-[16px]",
  xl: "w-[64px] h-[64px] rounded-[8px] text-[24px]",
};

/**
 * Standardized Product Avatar component matching the Products table:
 * - Warm light-beige background (#F5EFE6)
 * - Subtle rounded-square shape
 * - Bold dark-burgundy initial (#781529 / #7A1830)
 * - Graceful fallback to "P" for empty names
 */
export function ProductAvatar({
  name,
  image,
  size = "md",
  className = "",
}: ProductAvatarProps) {
  const sizeClasses = SIZE_STYLES[size] || SIZE_STYLES.md;
  const initial = (name?.trim()?.charAt(0) || "P").toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name || "Product"}
        className={`${sizeClasses} shrink-0 object-cover border border-[#EAE5E0] ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center select-none bg-[#F5EFE6] font-bold text-[#781529] ${sizeClasses} ${className}`}
    >
      {initial}
    </div>
  );
}
