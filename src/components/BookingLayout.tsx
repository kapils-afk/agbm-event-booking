import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, List, Menu, X, Home, Shield } from "lucide-react";

const navItems = [
  { to: "/booking/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/booking/new", label: "New Booking", icon: Plus },
  { to: "/booking/manage", label: "Manage Bookings", icon: List },
];

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-primary">Adi Goud Bhawan</h1>
          <p className="text-xs opacity-70 mt-0.5">Hall Booking System</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-sidebar-accent/50 transition-colors"
          >
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
          <h1 className="text-base font-bold text-sidebar-primary">Adi Goud Bhawan</h1>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-foreground/30" />
            <nav
              className="absolute top-0 left-0 w-64 h-full bg-sidebar text-sidebar-foreground p-4 space-y-1 pt-16"
              onClick={(e) => e.stopPropagation()}
            >
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-sidebar-accent/50 transition-colors mt-4 border-t border-sidebar-border pt-4"
              >
                <Home size={18} /> Back to Home
              </Link>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
