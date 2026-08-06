export function RatingStars({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${rating} out of 5${count != null ? `, ${count} reviews` : ""}`}
    >
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={i <= rounded ? "#C89B3C" : "#E6DFD1"}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {count != null && count > 0 && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}
