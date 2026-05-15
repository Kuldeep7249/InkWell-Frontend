import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Moon, PenLine, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { notificationApi } from "../../api/notificationApi.js";
import { unwrap } from "../../utils/helpers.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleTheme = () => document.documentElement.classList.toggle("dark");

  useEffect(() => {
    let active = true;

    const loadUnreadCount = async () => {
      if (!user) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const response = await notificationApi.getMyUnreadCount();
        const raw = unwrap(response);

        const count =
          typeof raw === "number"
            ? raw
            : raw?.count ??
              raw?.unreadCount ??
              raw?.data?.count ??
              raw?.data?.unreadCount ??
              0;

        if (active) setUnreadCount(Number(count) || 0);
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    loadUnreadCount();

    window.addEventListener("focus", loadUnreadCount);
    window.addEventListener("notifications:refresh", loadUnreadCount);

    return () => {
      active = false;
      window.removeEventListener("focus", loadUnreadCount);
      window.removeEventListener("notifications:refresh", loadUnreadCount);
    };
  }, [user, location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl transition-all dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="group flex items-center gap-3 text-xl font-black tracking-tight transition-transform hover:scale-105">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:bg-indigo-500">
            <PenLine size={20} />
          </span>
          InkWell
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/search", label: "Search" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              <span className="relative inline-flex items-center gap-2">
                <Bell size={18} />
                Notifications

                {unreadCount > 0 && (
                  <span className="absolute -right-5 -top-3 z-50 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-black text-white shadow-lg shadow-red-500/30 ring-2 ring-white dark:ring-slate-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}

          {["AUTHOR", "ADMIN"].includes(user?.role) && (
            <NavLink
              to="/author"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              Author
            </NavLink>
          )}

          {user?.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="btn-muted !px-3 !rounded-full aspect-square">
            <Moon className="hidden dark:block" size={18} />
            <Sun className="dark:hidden" size={18} />
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn-muted !rounded-full">
                {user.username || "Profile"}
              </Link>
              <button onClick={logout} className="btn-primary !rounded-full">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-muted !rounded-full">
                Login
              </Link>
              <Link to="/register" className="btn-primary !rounded-full">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
