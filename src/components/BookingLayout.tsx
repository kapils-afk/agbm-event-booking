import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Plus, List, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/booking/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/booking/new", label: "New Booking", icon: Plus },
  { to: "/booking/manage", label: "Manage Bookings", icon: List },
];

export default function BookingLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={20} className="text-orange-600" />
              <h1 className="font-bold truncate">Hall Booking System</h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className={active ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : ""}
                  >
                    <item.icon size={14} className="mr-1" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden border-t flex overflow-x-auto px-2 py-2 gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className="shrink-0">
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={active ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : ""}
                >
                  <item.icon size={14} className="mr-1" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </header>

      <main><Outlet /></main>
    </div>
  );
}
