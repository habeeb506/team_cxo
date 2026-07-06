export default function Footer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-400">
      &copy; {new Date().getFullYear()} Technet. All rights reserved.
    </footer>
  );
}
