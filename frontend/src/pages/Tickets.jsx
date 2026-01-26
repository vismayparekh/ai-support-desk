import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createTicket, listTickets } from "../api/tickets";
import Badge from "../components/Badge";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  // Create ticket form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  // List controls
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("NEWEST"); // NEWEST | OLDEST

  async function refresh() {
    const data = await listTickets();
    setTickets(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  // Filter + Sort in UI (fast enough for 100–500 items)
  const visibleTickets = useMemo(() => {
    let out = [...tickets];

    // filter by status
    if (status !== "ALL") out = out.filter((t) => t.status === status);

    // search title/description
    const s = q.trim().toLowerCase();
    if (s) {
      out = out.filter((t) => {
        const text = `${t.title} ${t.description}`.toLowerCase();
        return text.includes(s);
      });
    }

    // sort
    out.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "NEWEST" ? db - da : da - db;
    });

    return out;
  }, [tickets, q, status, sort]);

  return (
    // Full-height app page, no crazy scrolling
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: Create Ticket */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Create a ticket</h2>
            <p className="text-sm text-slate-600 mt-1">
              AI will auto-triage it in the background.
            </p>

            {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

            <div className="mt-5 space-y-3">
              <input
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Title (ex: Payment failed during checkout)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="w-full border rounded-xl px-3 py-2 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button
                className="w-full rounded-xl px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                onClick={async () => {
                  try {
                    setErr("");
                    if (!title.trim() || !description.trim()) {
                      return setErr("Please fill title and description.");
                    }
                    await createTicket({ title, description });
                    setTitle("");
                    setDescription("");
                    await refresh();
                  } catch {
                    setErr("Could not create ticket. Are you logged in?");
                  }
                }}
              >
                Submit ticket
              </button>

              <div className="text-xs text-slate-500">
                Tip: After creating a ticket, open it and refresh in a few seconds to see AI summary & reply.
              </div>
            </div>
          </div>

          {/* RIGHT: Ticket List (Scrollable Panel) */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            {/* Sticky header for list + controls */}
            <div className="p-5 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">My tickets</h2>
                <button className="text-sm underline" onClick={refresh}>
                  Refresh
                </button>
              </div>

              {/* Controls */}
              <div className="mt-4 grid sm:grid-cols-3 gap-3">
                <input
                  className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Search tickets..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />

                <select
                  className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>

                <select
                  className="border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="NEWEST">Newest first</option>
                  <option value="OLDEST">Oldest first</option>
                </select>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700">{visibleTickets.length}</span>{" "}
                of <span className="font-medium text-slate-700">{tickets.length}</span> tickets
              </div>
            </div>

            {/* Scroll area (fixed height) */}
            <div className="h-[calc(100vh-220px)] overflow-y-auto p-5 space-y-3">
              {visibleTickets.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="block border rounded-2xl p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {t.description}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>Status: {prettyStatus(t.status)}</Badge>
                    <Badge>Category: {t.category}</Badge>
                    <Badge>Priority: {t.priority}</Badge>
                    <Badge>Sentiment: {t.sentiment || "UNKNOWN"}</Badge>
                    <Badge>AI: {Number(t.ai_confidence || 0).toFixed(2)}</Badge>
                  </div>
                </Link>
              ))}

              {visibleTickets.length === 0 && (
                <div className="text-sm text-slate-600">
                  No tickets match your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function prettyStatus(s) {
  if (s === "IN_PROGRESS") return "IN PROGRESS";
  return s;
}
