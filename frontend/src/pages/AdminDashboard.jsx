import { useEffect, useState } from "react";
import { analyticsSummary } from "../api/tickets";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const d = await analyticsSummary();
      setData(d);
    })();
  }, []);

  if (!data) return <div className="max-w-6xl mx-auto px-4 py-10">Loading...</div>;

  const category = data.by_category.map((x) => ({ name: x.category, value: x.count }));
  const status = data.by_status.map((x) => ({ name: x.status, value: x.count }));
  const sentiment = data.by_sentiment.map((x) => ({ name: x.sentiment, value: x.count }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time ticket analytics (staff only).
            </p>
          </div>

          <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border">
            Live
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <Stat label="Total tickets" value={data.total} />
          <Stat
            label="Avg resolution time (sec)"
            value={data.avg_resolution_seconds ? Math.round(data.avg_resolution_seconds) : "—"}
          />
          <Stat label="Health" value="OK" accent="good" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Tickets by Category" subtitle="Which type of issues are most common">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={category} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Tickets" radius={[8, 8, 0, 0]}>
                {category.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Status" subtitle="Open vs resolved distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={status} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Tickets" radius={[8, 8, 0, 0]}>
                {status.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Sentiment" subtitle="How users feel overall">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sentiment} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Tickets" radius={[8, 8, 0, 0]}>
                {sentiment.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Share (Pie)" subtitle="Quick visual split by category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={category} dataKey="value" nameKey="name" outerRadius={95}>
                {category.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accentClass =
    accent === "good"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : "text-slate-900 bg-slate-50 border-slate-200";

  return (
    <div className="border rounded-2xl p-4 bg-white shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 flex items-center gap-3">
        <div className="text-2xl font-semibold">{value}</div>
        {accent === "good" && (
          <span className={`text-xs px-2 py-1 rounded-full border ${accentClass}`}>Healthy</span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
