export function StatCard({
  label,
  value,
  hint,
  accent = "orange",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "orange" | "green" | "blue" | "red";
}) {
  const accentMap = {
    orange: "border-orange-500",
    green: "border-green-500",
    blue: "border-blue-500",
    red: "border-red-500",
  };

  return (
    <div className={`rounded-xl border-l-4 ${accentMap[accent]} bg-white p-4 shadow-sm`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
