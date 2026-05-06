import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main content grows */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer always at bottom */}
      <footer className="mt-auto border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        InkWell — Write. Publish. Connect. Inspire.
      </footer>
    </div>
  );
}