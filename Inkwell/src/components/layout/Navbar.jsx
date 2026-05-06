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
      } catch (error) {
        console.error("Unread count error:", error);
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
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-black">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <PenLine size={18} />
          </span>
          InkWell
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLink to="/" className="hover:text-indigo-600">
            Home
          </NavLink>

          <NavLink to="/search" className="hover:text-indigo-600">
            Search
          </NavLink>

          {user && (
            <NavLink
              to="/notifications"
              className="relative flex items-center gap-2 hover:text-indigo-600"
            >
              <span className="relative inline-flex items-center gap-2">
                <Bell size={18} />
                Notifications

                {unreadCount > 0 && (
                  <span className="absolute -right-5 -top-3 z-50 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-black text-white shadow-lg ring-2 ring-white dark:ring-slate-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          )}

          {["AUTHOR", "ADMIN"].includes(user?.role) && (
            <NavLink to="/author" className="hover:text-indigo-600">
              Author
            </NavLink>
          )}

          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className="hover:text-indigo-600">
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-muted !px-3">
            <Moon className="hidden dark:block" size={16} />
            <Sun className="dark:hidden" size={16} />
          </button>

          {user ? (
            <>
              <Link to="/profile" className="btn-muted">
                {user.username || "Profile"}
              </Link>
              <button onClick={logout} className="btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-muted">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}