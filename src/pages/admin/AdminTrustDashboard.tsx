import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, List, IndianRupee, Trophy, HeartHandshake } from "lucide-react";

export default function AdminTrustDashboard() {
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [uniqueDonors, setUniqueDonors] = useState(0);
  const [topDonors, setTopDonors] = useState<{ donor_name: string; total: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("admin_session")) { navigate("/admin/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const stats = await api.getDonationStats();
    setCount(stats.count);
    setTotal(stats.total);
    setUniqueDonors(stats.uniqueDonors);
    setTopDonors(stats.topDonors);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft size={14} /></Button></Link>
            <div className="flex items-center gap-2">
              <HeartHandshake size={20} className="text-rose-500" />
              <h1 className="font-bold">AGBM Charitable Trust</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/trust/new">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Plus size={14} className="mr-1" /> New Entry
              </Button>
            </Link>
            <Link to="/admin/trust/list">
              <Button size="sm" variant="outline"><List size={14} className="mr-1" /> Donor List</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-44 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-rose-700" />
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/agbm-building.png)" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold">AGBM Charitable Trust</h2>
          <p className="text-sm md:text-base opacity-90 mt-1">Donor Management Dashboard</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-3xl font-bold text-emerald-600">
                <IndianRupee size={26} />{total.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all donations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Receipts</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{count}</div>
              <p className="text-xs text-muted-foreground mt-1">Donation entries recorded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unique Donors</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{uniqueDonors}</div>
              <p className="text-xs text-muted-foreground mt-1">Distinct contributors</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy size={18} className="text-amber-500" /> Top 5 Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topDonors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No donations recorded yet.</p>
            ) : (
              <ul className="divide-y">
                {topDonors.map((d, i) => (
                  <li key={d.donor_name} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-700" : "bg-slate-300"
                      }`}>{i + 1}</span>
                      <span className="font-medium">{d.donor_name}</span>
                    </div>
                    <span className="font-bold text-emerald-600 flex items-center">
                      <IndianRupee size={14} />{d.total.toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
