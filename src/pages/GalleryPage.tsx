import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
}

const staticGalleryItems: GalleryItem[] = [
  { id: "r1", title: "Community Gathering", description: "Moments from our community events", image_url: "/images/gallery/1.jpg", category: "Community Events" },
  { id: "r2", title: "Cultural Celebration", description: "Celebrating our rich heritage", image_url: "/images/gallery/2.jpg", category: "Community Events" },
  { id: "r3", title: "Festival Rituals", description: "Traditional ceremonies and rituals", image_url: "/images/gallery/3.jpg", category: "Festivals" },
  { id: "r4", title: "Wedding Ceremony", description: "Blessed union celebrations", image_url: "/images/gallery/4.jpg", category: "Weddings" },
  { id: "r5", title: "Annual Meet", description: "Members gathering together", image_url: "/images/gallery/5.jpg", category: "Annual Events" },
  { id: "r6", title: "Traditional Music", description: "Classical and devotional music", image_url: "/images/gallery/6.jpg", category: "Annual Events" },
  { id: "r7", title: "Community Event", description: "Special community programs", image_url: "/images/gallery/7.jpg", category: "Community Events" },
  { id: "r8", title: "Bhavan Gathering", description: "Events at Goud Bhavan", image_url: "/images/gallery/8.jpg", category: "Bhavan Events" },
  { id: "r9", title: "Cultural Program", description: "Performances and celebrations", image_url: "/images/gallery/9.jpg", category: "Festivals" },
  { id: "r10", title: "Community Meet", description: "Bringing everyone together", image_url: "/images/gallery/10.jpg", category: "Bhavan Events" },
];

export default function GalleryPage() {
  const [items] = useState<GalleryItem[]>(staticGalleryItems);
  const [preview, setPreview] = useState<GalleryItem | null>(null);

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
