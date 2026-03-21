interface Props {
  position: "between-results" | "sidebar" | "after-tool" | "after-results";
  className?: string;
}

export default function AdSlot({ position, className = "" }: Props) {
  return (
    <div
      className={`ad-slot ad-slot-${position} ${className}`}
      data-ad-position={position}
      style={{ minHeight: 0 }}
    >
      {/* Ad network code will be inserted here when traffic justifies it */}
      {/* Placeholder is invisible — zero height until ads are enabled */}
    </div>
  );
}
