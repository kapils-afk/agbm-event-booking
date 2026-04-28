import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminSession { id: string; name: string; mobile: string; is_super_admin: boolean; }
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
import {
  Users, Megaphone, Image, CalendarDays, Award, UserCheck,
  LogOut, ArrowLeft, Shield, LayoutDashboard, HeartHandshake
} from "lucide-react";

interface AdminSession {
  id: string;
  name: string;
  mobile: string;
  is_super_admin: boolean;
}

interface ModuleStats {
  members: number;
  announcements: number;
  gallery: number;
  events: number;
  officeBearers: number;
  trustCommittee: number;
  trust: number;
}

const modules = [
  { key: "members", title: "Registered Members", description: "Manage community member registrations", icon: Users, color: "from-blue-500 to-blue-600", route: "/admin/members" },
  { key: "announcements", title: "Announcements", description: "Post and manage community announcements", icon: Megaphone, color: "from-amber-500 to-orange-500", route: "/admin/announcements" },
  { key: "gallery", title: "Gallery", description: "Upload and manage event photos", icon: Image, color: "from-purple-500 to-pink-500", route: "/admin/gallery" },
  { key: "events", title: "Events", description: "Create and manage community events", icon: CalendarDays, color: "from-green-500 to-emerald-500", route: "/admin/events" },
  { key: "officeBearers", title: "Office Bearers", description: "Manage office bearer details and photos", icon: Award, color: "from-red-500 to-rose-500", route: "/admin/office-bearers" },
  { key: "trustCommittee", title: "Trust Committee", description: "Manage trust committee members", icon: UserCheck, color: "from-teal-500 to-cyan-500", route: "/admin/trust-committee" },
  { key: "trust", title: "Charitable Trust", description: "Donor entries, receipts & dashboard", icon: HeartHandshake, color: "from-rose-500 to-pink-600", route: "/admin/trust" },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [stats, setStats] = useState<ModuleStats>({ members: 0, announcements: 0, gallery: 0, events: 0, officeBearers: 0, trustCommittee: 0, trust: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) { navigate("/admin/login"); return; }
    setAdmin(JSON.parse(session));
    api.adminStats().then(setStats).catch(() => {});
  }, [navigate]);

  const fetchStats = async () => {
    const [m, a, g, e, ob, tc, tr] = await Promise.all([
      supabase.from("members").select("id", { count: "exact", head: true }),
      supabase.from("announcements").select("id", { count: "exact", head: true }),
      supabase.from("gallery").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("office_bearers").select("id", { count: "exact", head: true }),
      supabase.from("trust_committee").select("id", { count: "exact", head: true }),
      supabase.from("donations").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      members: m.count || 0,
      announcements: a.count || 0,
      gallery: g.count || 0,
      events: e.count || 0,
      officeBearers: ob.count || 0,
      trustCommittee: tc.count || 0,
      trust: tr.count || 0,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    navigate("/admin/login");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xs"><Shield size={16} /></div>
            <div>
              <h1 className="text-sm font-bold text-foreground flex items-center gap-1"><LayoutDashboard size={14} /> Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {admin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft size={14} className="mr-1" /> Home</Button></Link>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut size={14} className="mr-1" /> Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Manage Modules</h2>
          <p className="text-muted-foreground text-sm mt-1">Select a module to manage its content</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const count = stats[mod.key as keyof typeof stats];
            return (
              <Link key={mod.key} to={mod.route}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}><mod.icon size={22} /></div>
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                    </div>
                    <CardTitle className="text-base mt-2">{mod.title}</CardTitle>
                    <CardDescription className="text-xs">{mod.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" size="sm" className="text-xs px-0 text-orange-600 hover:text-orange-700">Manage →</Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/booking/dashboard"><Button variant="outline" size="sm">📋 Hall Booking System</Button></Link>
            <Link to="/admin/members"><Button variant="outline" size="sm">➕ Add New Member</Button></Link>
            <Link to="/admin/announcements"><Button variant="outline" size="sm">📢 Post Announcement</Button></Link>
          </div>
        </div>
      </main>
    </div>
  );
}
