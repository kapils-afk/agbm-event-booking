import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { User, Users, Award, UserCheck, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearMemberSession, getMemberSession } from "@/lib/memberSession";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { to: "/member/profile", label: "My Profile", icon: User },
  { to: "/member/members", label: "Members", icon: Users },
  { to: "/member/office-bearers", label: "Office Bearers", icon: Award },
  { to: "/member/trust-committee", label: "Trust Committee", icon: UserCheck },
];

export default function MemberLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const session = getMemberSession();

  useEffect(() => {
    if (!session) navigate("/", { replace: true });
  }, [session, navigate]);

  const logout = () => {
    clearMemberSession();
    toast({ title: "Logged out" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/"><Button variant="ghost" size="sm"><Home size={14} className="mr-1" /> Home</Button></Link>
            <div className="flex items-center gap-2 min-w-0">
              <img src="/images/agbm-logo.png" alt="" className="w-7 h-7 rounded-full object-cover" />
              <h1 className="font-bold truncate">Member Portal</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground">Hi, {session?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}><LogOut size={14} className="mr-1" /> Logout</Button>
          </div>
        </div>
        <nav className="border-t flex overflow-x-auto px-2 py-2 gap-1 max-w-7xl mx-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} className="shrink-0">
                <Button
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  className={active ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" : ""}
                >
                  <item.icon size={14} className="mr-1" />
                  {item.label}
                </Button>
              </NavLink>
            );
          })}
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
