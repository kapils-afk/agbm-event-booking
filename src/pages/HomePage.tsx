import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, Heart, MapPin, Phone, Mail, ArrowRight, Facebook, Instagram, Twitter, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import MemberLoginDialog from "@/components/MemberLoginDialog";

interface SiteStats {
  activeMembers: number;
  eventsOrganized: number;
  yearsOfService: number;
}

const defaultStats: SiteStats = {
  activeMembers: 1000,
  eventsOrganized: 150,
  yearsOfService: 15,
};

export default function HomePage() {
  const [stats, setStats] = useState<SiteStats>(defaultStats);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    // fetch("/api/site-stats").then(r => r.json()).then(setStats);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">AG</div>
            <span className="font-bold text-foreground text-sm md:text-base">Adi Goud Brahmin Mahasabha</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#home" className="hover:text-foreground transition-colors">Home</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setLoginOpen(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0">
              <Users size={14} className="mr-1" /> Member Login
            </Button>
            <Link to="/admin/login">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                <Shield size={14} className="mr-1" /> Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-[url('/images/adigoud-banner.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-20 md:py-28">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">AG</div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Adi Goud Brahmin Mahasabha</h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Uniting our community through tradition, culture, and shared values. Together we celebrate our heritage and build a stronger future for generations to come.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent" onClick={() => setLoginOpen(true)}>
              Member Login <ArrowRight size={14} className="ml-1" />
            </Button>
            <a href="#contact">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent">
                Contact Us
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-card">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 text-center">
          {[
            { icon: Users, value: `${stats.activeMembers}+`, label: "Active Members" },
            { icon: CalendarDays, value: `${stats.eventsOrganized}+`, label: "Events Organized" },
            { icon: Heart, value: `${stats.yearsOfService}+`, label: "Years of Service" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
                <item.icon className="text-orange-500" size={26} />
              </div>
              <p className="text-2xl font-bold text-orange-500">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-orange-50/50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-orange-500 mb-2">About Our Community</p>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>The Adi Goud Brahmin Mahasabha is a vibrant community organization dedicated to preserving and promoting our rich cultural heritage. For over 25 years, we have been bringing together families across India.</p>
              <p>Our mission is to foster unity, support educational initiatives, organize cultural events, and provide a platform for community members to connect, collaborate, and grow together.</p>
              <p>Through various programs, festivals, and social initiatives, we strive to create meaningful experiences that strengthen our bonds and pass on our cherished traditions.</p>
            </div>
            <Button size="sm" className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" onClick={() => setLoginOpen(true)}>
              Join Us <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src="/images/agbm-building.jpg" alt="Adi Goud Brahmin Mahasabha Building" className="w-full h-auto object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Join Our Growing Community</h2>
          <p className="opacity-90 text-sm md:text-base mb-6">Be part of a thriving community that values tradition, culture, and togetherness.</p>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent" onClick={() => setLoginOpen(true)}>
            Member Login <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-white/80 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">AG</div>
              <span className="font-bold text-white text-sm">Adi Goud Brahmin Mahasabha</span>
            </div>
            <p className="text-xs opacity-70">Preserving our heritage, building our future together as one community.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Contact Us</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-orange-400" /><span>Adi Goud Brahmin Mahasabha Charitable Trust, 417, Vegetarian Village, Puzhal, Chennai, Tamil Nadu 600060</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="shrink-0 text-orange-400" /><span>+91 7603961126</span></div>
              <div className="flex items-center gap-2"><Mail size={14} className="shrink-0 text-orange-400" /><span>agbm.chennai@gmail.com</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Follow Us</h3>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 transition-colors flex items-center justify-center"><Icon size={16} /></a>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Adi Goud Brahmin Mahasabha. All rights reserved.
        </div>
      </footer>

      {/* Member Login Dialog */}
      <MemberLoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
}
