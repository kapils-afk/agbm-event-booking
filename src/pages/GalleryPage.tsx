import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
}

const defaultItems: GalleryItem[] = [
  { id: "d1", title: "Annual Festival", description: "Grand celebration", image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80", category: "Annual Cultural Festival" },
  { id: "d2", title: "Cultural Evening", description: "Classical music", image_url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80", category: "Annual Cultural Festival" },
  { id: "d3", title: "Wedding Ceremony", description: "Community wedding", image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", category: "Community Weddings" },
  { id: "d4", title: "Reception", description: "Joyful moments", image_url: "https://images.unsplash.com/photo-1604608672516-f1b9b1d0f1f0?auto=format&fit=crop&w=1200&q=80", category: "Community Weddings" },
  { id: "d5", title: "Annual Meet", description: "Members gathering", image_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80", category: "Annual General Meet" },
  { id: "d6", title: "Community Gathering", description: "Together as one", image_url: "https://images.unsplash.com/photo-1566499546069-3fc74ff23449?auto=format&fit=crop&w=1200&q=80", category: "Annual General Meet" },
  { id: "d7", title: "Festival Rituals", description: "Traditional rituals", image_url: "https://images.unsplash.com/photo-1604608672394-51d8c0b5f4a0?auto=format&fit=crop&w=1200&q=80", category: "Festivals & Pujas" },
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(defaultItems);
  const [preview, setPreview] = useState<GalleryItem | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("gallery").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (data && data.length > 0) setItems(data as GalleryItem[]);
    })();
  }, []);

  const grouped = items.reduce<Record<string, GalleryItem[]>>((acc, it) => {
    const key = it.category || "Other Moments";
    (acc[key] = acc[key] || []).push(it);
    return acc;
  }, {});

  const sections = Object.entries(grouped);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft size={14} className="mr-1" /> Home</Button></Link>
            <div className="flex items-center gap-2">
              <img src="/images/agbm-logo.png" alt="AGBM Logo" className="w-8 h-8 rounded-full object-cover" />
              <span className="font-bold text-sm md:text-base">AGBM Gallery</span>
            </div>
          </div>
          <Link to="/admin/login">
            <Button size="sm" variant="outline"><Shield size={14} className="mr-1" /> Admin</Button>
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold opacity-90 mb-2 flex items-center justify-center gap-2">
            <ImageIcon size={16} /> Photo Gallery
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Moments from Our Events</h1>
          <p className="mt-2 opacity-90 text-sm md:text-base">Browse memories from our festivals, weddings, and community gatherings.</p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full">
        {sections.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No gallery items yet.</Card>
        ) : (
          sections.map(([section, list]) => (
            <div key={section} className="mb-12">
              <div className="flex items-end justify-between mb-4 border-b border-border pb-2">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{section}</h2>
                <span className="text-xs text-muted-foreground">{list.length} photo{list.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {list.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => setPreview(it)}
                    className="group rounded-xl overflow-hidden shadow-md aspect-square relative text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <img
                      src={it.image_url}
                      alt={it.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-medium line-clamp-1">{it.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

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
              <img src={preview.image_url} alt={preview.title} className="w-full max-h-[70vh] object-contain bg-black" />
              <div className="p-4">
                <h3 className="font-semibold text-foreground">{preview.title}</h3>
                {preview.category && <p className="text-xs text-orange-500 font-medium mt-0.5">{preview.category}</p>}
                {preview.description && <p className="text-sm text-muted-foreground mt-2">{preview.description}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
