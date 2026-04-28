import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUploader({ value, onChange, folder = "uploads", maxSizeMB = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file (JPG, PNG, WEBP, GIF)", variant: "destructive" });
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({ title: "File too large", description: `Maximum size is ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("public-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: "Uploaded", description: "Image uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="w-32 h-32 object-cover rounded-md border" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
          <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => onChange("")}>
            <X size={12} />
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}
          {uploading ? "Uploading..." : value ? "Replace Image" : "Upload Image"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setUrlInput(!urlInput)}>
          {urlInput ? "Hide URL" : "Or paste URL"}
        </Button>
        <span className="text-xs text-muted-foreground">Max {maxSizeMB}MB · JPG, PNG, WEBP, GIF</span>
      </div>
      {urlInput && (
        <Input placeholder="https://..." value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}
