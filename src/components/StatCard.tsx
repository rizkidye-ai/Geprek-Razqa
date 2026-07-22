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
    orange: { bar: "from-orange-400 to-orange-600", glow: "bg-orange-100/70" },
    green: { bar: "from-green-400 to-green-600", glow: "bg-green-100/70" },
    blue: { bar: "from-blue-400 to-blue-600", glow: "bg-blue-100/70" },
    red: { bar: "from-red-400 to-red-600", glow: "bg-red-100/70" },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full ${accentMap[accent].glow} blur-xl transition group-hover:scale-110`} />
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accentMap[accent].bar}`} />
      <p className="relative text-xs font-medium text-gray-500">{label}</p>
      <p className="relative mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="relative mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
