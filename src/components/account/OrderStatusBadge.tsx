export function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processing: "bg-gold/15 text-gold-deep",
    completed: "bg-gold/15 text-gold-deep",
    pending: "bg-sand text-charcoal/60",
    "on-hold": "bg-sand text-charcoal/60",
    cancelled: "bg-red-50 text-red-600",
    failed: "bg-red-50 text-red-600",
    refunded: "bg-royal/10 text-royal",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
        styles[status] ?? "bg-sand text-charcoal/60"
      }`}
    >
      {status}
    </span>
  );
}
