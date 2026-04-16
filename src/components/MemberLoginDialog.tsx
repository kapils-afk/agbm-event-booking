import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Phone, Lock, LogIn } from "lucide-react";

interface MemberLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberLoginDialog({ open, onOpenChange }: MemberLoginDialogProps) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) {
      toast({ title: "Error", description: "Please enter mobile number and password", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("mobile", mobile)
        .eq("password_hash", password)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        localStorage.setItem("member_session", JSON.stringify({ id: data.id, name: data.name, mobile: data.mobile }));
        toast({ title: "Welcome!", description: `Logged in as ${data.name}` });
        onOpenChange(false);
        navigate("/booking/dashboard");
      } else {
        toast({ title: "Login Failed", description: "Invalid mobile number or password", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Login failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">AG</div>
            <div>
              <DialogTitle className="text-lg">Member Login</DialogTitle>
              <DialogDescription>Login with your registered mobile number</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="member-mobile">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="pl-10"
                maxLength={10}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" disabled={loading}>
            <LogIn size={16} className="mr-2" />
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
