export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border">
      {children}
    </span>
  );
}
