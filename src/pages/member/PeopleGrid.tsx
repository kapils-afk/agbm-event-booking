import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award } from "lucide-react";

interface Props { fetcher: () => Promise<any[]>; title: string; iconColor?: string; }

export default function PeopleGrid({ fetcher, title, iconColor = "text-orange-500" }: Props) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { fetcher().then((d) => setItems((d || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)))).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className={iconColor} />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      {items.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No entries available.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-3 ring-2 ring-orange-100">
                  <AvatarImage src={p.photo_url || undefined} alt={p.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">{(p.name || "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.designation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
