import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, Heart, MapPin, Phone, Mail, ArrowRight, Facebook, Instagram, Twitter, Shield, MessageSquare, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SiteStats {
  activeMembers: number;
  eventsOrganized: number;
  yearsOfService: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string | null;
  image_url?: string | null;
}

const defaultStats: SiteStats = {
  activeMembers: 1000,
  eventsOrganized: 150,
  yearsOfService: 15,
};

const defaultGallery = [
  { url: "https://images.unsplash.com/photo-1566499546069-3fc74ff23449?auto=format&fit=crop&w=1200&q=80", title: "Community Gathering" },
  { url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d0f1f0?auto=format&fit=crop&w=1200&q=80", title: "Cultural Celebration" },
  { url: "https://images.unsplash.com/photo-1604608672394-51d8c0b5f4a0?auto=format&fit=crop&w=1200&q=80", title: "Festival Rituals" },
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", title: "Wedding Ceremony" },
  { url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80", title: "Annual Meet" },
  { url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80", title: "Traditional Music" },
];

const defaultEvents: EventItem[] = [
  {
    id: "d1",
    title: "Annual Cultural Festival 2026",
    description: "A grand celebration of our traditions with music, dance and feast.",
    event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    venue: "AGBM Bhavan, Puzhal, Chennai",
    image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "d2",
    title: "Community Wedding Ceremony",
    description: "Blessed union hosted at our community hall.",
    event_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    venue: "AGBM Bhavan",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "d3",
    title: "Youth Sangeet Evening",
    description: "An evening of classical and devotional music by our youth.",
    event_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    venue: "AGBM Bhavan",
    image_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  const [stats] = useState<SiteStats>(defaultStats);
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [galleryApi, setGalleryApi] = useState<CarouselApi | undefined>();
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const autoplayRef = useRef<number | null>(null);

  // Contact form
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forum posts (local demo)
  const [forumPosts, setForumPosts] = useState<{ id: string; name: string; message: string; at: string }[]>([
    { id: "f1", name: "Ramesh Goud", message: "Looking forward to the Annual Cultural Festival! Who else is attending?", at: new Date(Date.now() - 3600000).toISOString() },
    { id: "f2", name: "Priya S.", message: "Thank you to the trust for the wonderful wedding arrangements last week.", at: new Date(Date.now() - 86400000).toISOString() },
  ]);
  const [forumInput, setForumInput] = useState({ name: "", message: "" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });
      if (data && data.length > 0) {
        setEvents(data as EventItem[]);
      }
    })();
  }, []);

  // Autoplay carousel
  useEffect(() => {
    if (!galleryApi) return;
    autoplayRef.current = window.setInterval(() => {
      if (galleryApi.canScrollNext()) galleryApi.scrollNext();
      else galleryApi.scrollTo(0);
    }, 3000);
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current);
    };
  }, [galleryApi]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Store as announcement-style note is not ideal; just simulate success.
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      setForm({ name: "", email: "", mobile: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForumPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumInput.name.trim() || !forumInput.message.trim()) return;
    setForumPosts((prev) => [
      { id: crypto.randomUUID(), name: forumInput.name, message: forumInput.message, at: new Date().toISOString() },
      ...prev,
    ]);
    setForumInput({ name: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/images/agbm-logo.png" alt="AGBM Logo" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-bold text-foreground text-sm md:text-base">Adi Goud Brahmin Mahasabha</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#home" className="hover:text-foreground transition-colors">Home</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
            <a href="#gallery" className="hover:text-foreground transition-colors">Gallery</a>
            <a href="#events" className="hover:text-foreground transition-colors">Events</a>
            <a href="#forum" className="hover:text-foreground transition-colors">Forum</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/admin/login">
              <Button size="sm" variant="outline">
                <Shield size={14} className="mr-1" /> Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 py-20 md:py-28">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <img src="/images/agbm-logo.png" alt="AGBM Logo" className="w-12 h-12 rounded-full object-cover" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Adi Goud Brahmin Mahasabha</h1>
          <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Uniting our community through tradition, culture, and shared values. Together we celebrate our heritage and build a stronger future for generations to come.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#events">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 bg-transparent">
                Upcoming Events <ArrowRight size={14} className="ml-1" />
              </Button>
            </a>
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
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <img src="/images/agbm-building.png" alt="Chhabil Das Gulab Rai Goud Bhavan Chennai" className="w-full h-auto object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
          </div>
        </div>
      </section>

      {/* Gallery Carousel */}
      <section id="gallery" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-500 mb-2 flex items-center justify-center gap-2">
              <ImageIcon size={16} /> Our Gallery
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Moments from Our Community</h2>
          </div>
          <Carousel setApi={setGalleryApi} opts={{ loop: true, align: "start" }} className="px-10">
            <CarouselContent>
              {defaultGallery.map((g, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <button
                    type="button"
                    onClick={() => setPreview({ url: g.url, title: g.title })}
                    className="rounded-xl overflow-hidden shadow-md group relative aspect-[4/3] block w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{g.title}</p>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="text-center mt-8">
            <Link to="/gallery">
              <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                View Full Gallery <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Lightbox */}
        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background">
            {preview && (
              <div className="relative">
                <button
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
                <img src={preview.url} alt={preview.title} className="w-full max-h-[70vh] object-contain bg-black" />
                <div className="p-4">
                  <h3 className="font-semibold text-foreground">{preview.title}</h3>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 bg-orange-50/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-500 mb-2 flex items-center justify-center gap-2">
              <CalendarDays size={16} /> Events
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Upcoming & Recent Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((ev, i) => (
              <Card key={ev.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={ev.image_url || defaultEvents[i % defaultEvents.length].image_url || ""}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-orange-500 font-semibold mb-1">
                    {new Date(ev.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h3 className="font-bold text-foreground mb-2">{ev.title}</h3>
                  {ev.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ev.description}</p>}
                  {ev.venue && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={12} /> {ev.venue}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Section */}
      <section id="forum" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-orange-500 mb-2 flex items-center justify-center gap-2">
              <MessageSquare size={16} /> Community Forum
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Share & Connect</h2>
            <p className="text-sm text-muted-foreground mt-2">Ask questions, share thoughts, or celebrate with the community.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Post form */}
            <Card className="p-5 h-fit">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Start a new post</h3>
              <form onSubmit={handleForumPost} className="space-y-3">
                <Input
                  placeholder="Your name"
                  value={forumInput.name}
                  onChange={(e) => setForumInput({ ...forumInput, name: e.target.value })}
                  maxLength={60}
                />
                <Textarea
                  placeholder="Write a message to the community..."
                  value={forumInput.message}
                  onChange={(e) => setForumInput({ ...forumInput, message: e.target.value })}
                  maxLength={500}
                  rows={6}
                />
                <div className="flex justify-end">
                  <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    Post
                  </Button>
                </div>
              </form>
            </Card>

            {/* Right: Scrollable posts */}
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center justify-between">
                <span>Recent posts</span>
                <span className="text-xs text-muted-foreground font-normal">{forumPosts.length} messages</span>
              </h3>
              <ScrollArea className="h-[360px] pr-3">
                <div className="space-y-3">
                  {forumPosts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No posts yet. Be the first to share!</p>
                  )}
                  {forumPosts.map((p) => (
                    <div key={p.id} className="border border-border rounded-lg p-3 bg-orange-50/30">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(p.at).toLocaleString("en-IN")}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer with compact contact form */}
      <footer id="contact" className="bg-foreground text-white/80 py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/images/agbm-logo.png" alt="AGBM Logo" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-bold text-white text-sm">Adi Goud Brahmin Mahasabha</span>
            </div>
            <p className="text-xs opacity-70">Preserving our heritage, building our future together as one community.</p>
            <div className="flex gap-3 mt-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-orange-500 transition-colors flex items-center justify-center"><Icon size={14} /></a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Contact Us</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-orange-400" /><span>417, Vegetarian Village, Puzhal, Chennai, Tamil Nadu 600060</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="shrink-0 text-orange-400" /><span>+91 7603961126</span></div>
              <div className="flex items-center gap-2"><Mail size={14} className="shrink-0 text-orange-400" /><span>agbm.chennai@gmail.com</span></div>
            </div>
          </div>

          {/* Compact contact form */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-white text-sm mb-3">Reach the Admin</h3>
            {submitted ? (
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                  <CheckCircle2 className="text-green-400" size={20} />
                </div>
                <p className="text-white text-sm font-semibold mb-1">Thank You!</p>
                <p className="text-xs opacity-70 mb-3">Your message has been received.</p>
                <Button size="sm" variant="outline" onClick={() => setSubmitted(false)} className="bg-transparent border-white/30 text-white hover:bg-white hover:text-foreground">
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" maxLength={100} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-xs" />
                  <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile" maxLength={20} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-xs" />
                </div>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" maxLength={255} className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-9 text-xs" />
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message *" rows={3} maxLength={1000} required className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-xs resize-none" />
                <Button type="submit" size="sm" disabled={submitting} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Adi Goud Brahmin Mahasabha. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
