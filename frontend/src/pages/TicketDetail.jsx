import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "../components/Badge";
import {
  createComment,
  getTicket,
  listComments,
  updateTicket,
} from "../api/tickets";

export default function TicketDetail({ user }) {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");

  async function refresh() {
    const t = await getTicket(id);
    setTicket(t);
    const c = await listComments(id);
    setComments(c);
  }

  useEffect(() => {
    refresh();
  }, [id]);

  const headerMeta = useMemo(() => {
    if (!ticket) return null;
    return {
      status: ticket.status,
      category: ticket.category,
      priority: ticket.priority,
      sentiment: ticket.sentiment || "UNKNOWN",
      conf: Number(ticket.ai_confidence || 0).toFixed(2),
    };
  }, [ticket]);

  if (!ticket) return <div className="max-w-6xl mx-auto px-4 py-10">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/tickets"
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            ← Back to tickets
          </Link>

          <button className="text-sm underline" onClick={refresh}>
            Refresh
          </button>
        </div>

        {/* Ticket header card */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {ticket.title}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                {ticket.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill type="status" value={headerMeta.status} />
                <Pill type="category" value={headerMeta.category} />
                <Pill type="priority" value={headerMeta.priority} />
                <Pill type="sentiment" value={headerMeta.sentiment} />
                <Pill type="ai" value={`AI conf: ${headerMeta.conf}`} />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Created: {new Date(ticket.created_at).toLocaleString()}
                {ticket.resolved_at ? (
                  <> • Resolved: {new Date(ticket.resolved_at).toLocaleString()}</>
                ) : null}
              </div>
            </div>

            {/* Staff actions */}
            {user?.is_staff && (
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
                  onClick={async () => {
                    await updateTicket(ticket.id, { status: "IN_PROGRESS" });
                    await refresh();
                  }}
                >
                  Mark In Progress
                </button>
                <button
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm shadow-sm"
                  onClick={async () => {
                    await updateTicket(ticket.id, { status: "RESOLVED" });
                    await refresh();
                  }}
                >
                  Mark Resolved
                </button>
              </div>
            )}
          </div>

          {/* AI cards */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <AICard
              title="AI Summary"
              text={
                ticket.ai_summary
                  ? ticket.ai_summary
                  : "AI is still analyzing... refresh in a few seconds."
              }
              onCopy={async () => {
                await copyText(ticket.ai_summary || "");
                flashCopied(setCopied, "summary");
              }}
              copied={copied === "summary"}
            />

            <AICard
              title="AI Suggested Reply"
              text={
                ticket.ai_suggested_reply
                  ? ticket.ai_suggested_reply
                  : "AI is still generating a reply..."
              }
              onCopy={async () => {
                await copyText(ticket.ai_suggested_reply || "");
                flashCopied(setCopied, "reply");
              }}
              copied={copied === "reply"}
              pre
            />
          </div>

          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
        </div>

        {/* Comments */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Comments</h2>
            <button className="text-sm underline" onClick={refresh}>
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="border rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    @{c.author.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                  {c.message}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-sm text-slate-600">No comments yet.</div>
            )}
          </div>

          {/* Add comment */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Write a comment..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
              onClick={async () => {
                try {
                  setErr("");
                  if (!message.trim()) return;
                  await createComment(ticket.id, message);
                  setMessage("");
                  await refresh();
                } catch {
                  setErr("Could not add comment.");
                }
              }}
            >
              Send
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Tip: Add internal notes / updates so the AI analytics reflect resolution patterns.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Pill({ type, value }) {
  // color styles
  const cls = pillClass(type, value);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {pretty(type, value)}
    </span>
  );
}

function pillClass(type, value) {
  const v = String(value || "").toUpperCase();

  if (type === "status") {
    if (v === "OPEN") return "bg-blue-50 text-blue-700 border-blue-200";
    if (v === "IN_PROGRESS") return "bg-amber-50 text-amber-700 border-amber-200";
    if (v === "RESOLVED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  if (type === "priority") {
    if (v === "LOW") return "bg-slate-50 text-slate-700 border-slate-200";
    if (v === "MEDIUM") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (v === "HIGH") return "bg-orange-50 text-orange-700 border-orange-200";
    if (v === "CRITICAL") return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  if (type === "sentiment") {
    if (v === "POSITIVE") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (v === "NEUTRAL") return "bg-slate-50 text-slate-700 border-slate-200";
    if (v === "ANGRY") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  }

  if (type === "category") {
    return "bg-violet-50 text-violet-700 border-violet-200";
  }

  // AI
  return "bg-teal-50 text-teal-700 border-teal-200";
}

function pretty(type, value) {
  if (type === "status" && value === "IN_PROGRESS") return "Status: IN PROGRESS";
  if (type === "status") return `Status: ${value}`;
  if (type === "category") return `Category: ${value}`;
  if (type === "priority") return `Priority: ${value}`;
  if (type === "sentiment") return `Sentiment: ${value}`;
  return value;
}

function AICard({ title, text, onCopy, copied, pre }) {
  return (
    <div className="border rounded-2xl p-5 bg-gradient-to-b from-slate-50 to-white">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-slate-900">{title}</div>

        <button
          className="text-xs px-2 py-1 rounded-lg border bg-white hover:bg-slate-50"
          onClick={onCopy}
          disabled={!text}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={`text-sm text-slate-700 mt-3 ${pre ? "whitespace-pre-wrap" : ""}`}>
        {text}
      </div>
    </div>
  );
}

async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
  } catch {
    // ignore
  }
}

function flashCopied(setCopied, key) {
  setCopied(key);
  setTimeout(() => setCopied(""), 1200);
}
