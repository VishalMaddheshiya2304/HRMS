export default function StatCard({ label, value, sub, color = "blue", icon }) {
  const colorMap = {
    blue:   { bg: "bg-blue-50",   text: "text-accent",   icon: "bg-blue-100" },
    green:  { bg: "bg-green-50",  text: "text-present",  icon: "bg-green-100" },
    red:    { bg: "bg-red-50",    text: "text-absent",   icon: "bg-red-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100" },
  };
  const c = colorMap[color];

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
