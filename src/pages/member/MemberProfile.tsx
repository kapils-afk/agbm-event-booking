import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getMemberSession } from "@/lib/memberSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Edit, Save, X, Mail, Phone, MapPin, IdCard, Droplet, User } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function MemberProfile() {
  const session = getMemberSession();
  const { toast } = useToast();
  const [member, setMember] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    if (!session) return;
    try {
      const all = await api.getMembers();
      const m = all.find((x: any) => x.id === session.id);
      if (m) {
        setMember(m);
        setForm({
          name: m.name || "",
          mobile: m.mobile || "",
          email: m.email || "",
          aadhaar: m.aadhaar || "",
          address: m.address || "",
          blood_group: m.blood_group || "",
          photo_url: m.photo_url || "",
          password: "",
        });
      }
    } catch (e: any) {
      toast({ title: "Failed to load profile", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        mobile: form.mobile,
        email: form.email || null,
        aadhaar: form.aadhaar || null,
        address: form.address || null,
        blood_group: form.blood_group || null,
        photo_url: form.photo_url || null,
      };
      if (form.password) payload.password = form.password;
      await api.updateMember(session.id, payload);
      toast({ title: "Profile updated" });
      setEditing(false);
      load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!member) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const initials = (member.name || "M").split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="animate-fade-in">
      <div className="relative h-40 md:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-rose-600" />
        <div className="relative max-w-5xl mx-auto px-6 h-full flex items-end pb-6">
          <div className="flex items-end gap-4 text-white">
            <Avatar className="w-24 h-24 md:w-28 md:h-28 ring-4 ring-white shadow-lg">
              <AvatarImage src={member.photo_url || undefined} alt={member.name} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">{member.name}</h2>
              <p className="text-sm md:text-base opacity-90">Member ID: {member.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6 -mt-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><User size={18} /> Profile Details</CardTitle>
            {!editing ? (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Edit size={14} className="mr-1" /> Edit</Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); load(); }}><X size={14} className="mr-1" /> Cancel</Button>
            )}
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Field icon={<User size={14} />} label="Full Name" value={member.name} />
                <Field icon={<Phone size={14} />} label="Mobile" value={member.mobile} />
                <Field icon={<Mail size={14} />} label="Email" value={member.email || "—"} />
                <Field icon={<Droplet size={14} className="text-red-500" />} label="Blood Group" value={member.blood_group || "—"} />
                <Field icon={<IdCard size={14} />} label="Aadhaar" value={member.aadhaar || "—"} />
                <Field icon={<MapPin size={14} />} label="Address" value={member.address || "—"} />
              </div>
            ) : (
              <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Profile Photo</Label>
                  <ImageUploader value={form.photo_url} onChange={(url) => setForm((f: any) => ({ ...f, photo_url: url }))} folder={`members/${session?.id}`} maxSizeMB={3} />
                </div>
                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label>Mobile *</Label><Input value={form.mobile} maxLength={10} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div>
                  <Label>Blood Group</Label>
                  <Select value={form.blood_group || "none"} onValueChange={(v) => setForm({ ...form, blood_group: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Aadhaar</Label><Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Address</Label><Textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>New Password (leave blank to keep)</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <Save size={14} className="mr-1" /> {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
