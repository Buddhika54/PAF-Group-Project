const statusBadge = (s) => {
  const m = {
    ACTIVE: "bg-green-100 text-green-700",
    OUT_OF_SERVICE: "bg-gray-100 text-gray-600",
    UNDER_MAINTENANCE: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m[s]}`}>
      {s}
    </span>
  );
};