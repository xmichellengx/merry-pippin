"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Camera, Image as ImageIcon, X, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { getCats, getPhotos, addPhoto, deletePhoto } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { Cat, Photo } from "@/lib/supabase";
import { CatWithCamera, CatSleeping } from "@/components/CatIllustrations";
import { useAdmin } from "@/components/AdminContext";

export default function PhotosPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { isAdmin } = useAdmin();
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    Promise.all([getCats(), getPhotos()])
      .then(([c, p]) => { setCats(c); setPhotos(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (uploadError) {
        // If storage bucket doesn't exist, use data URL as fallback
        const reader = new FileReader();
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          await addPhoto({
            url: dataUrl,
            ...(selectedCatId ? { cat_id: selectedCatId } : {}),
            ...(caption ? { caption } : {}),
          });
          loadData();
        };
        reader.readAsDataURL(file);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
      await addPhoto({
        url: publicUrl,
        ...(selectedCatId ? { cat_id: selectedCatId } : {}),
        ...(caption ? { caption } : {}),
      });
    }

    setShowUpload(false);
    setCaption("");
    setUploading(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    setSelectedPhoto(null);
  };

  if (loading) {
    return <div className="flex flex-col items-center justify-center h-[70vh] gap-3"><CatSleeping size={120} className="opacity-30" /><Loader2 size={32} className="text-golden-500 animate-spin" /></div>;
  }

  return (
    <div className="px-4 pt-12 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center"><ArrowLeft size={16} className="text-golden-700" /></Link>
          <h1 className="text-lg font-bold">Photo Gallery</h1>
        </div>
        {isAdmin && <button onClick={() => setShowUpload(!showUpload)} className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"><Plus size={18} className="text-white" /></button>}
      </div>

      {isAdmin && showUpload && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Add Photos</h3>
          <p className="text-xs text-muted">Upload from your camera roll (iCloud photos sync automatically on iPhone)</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => fileInputRef.current?.click()} className="card p-4 text-center card-hover">
              <ImageIcon size={24} className="text-golden-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Photo Library</p>
            </button>
            <button onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute("capture", "environment");
                fileInputRef.current.click();
                fileInputRef.current.removeAttribute("capture");
              }
            }} className="card p-4 text-center card-hover">
              <Camera size={24} className="text-golden-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Take Photo</p>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
          <div>
            <label className="text-xs text-muted block mb-1">Which cat?</label>
            <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)}>
              <option value="">Both / Unknown</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Caption</label>
            <input type="text" placeholder="Optional caption..." value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          {uploading && <div className="flex items-center gap-2 text-xs text-muted"><Loader2 size={14} className="animate-spin" /> Uploading...</div>}
          <button onClick={() => setShowUpload(false)} className="w-full py-2 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium">Cancel</button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="card p-8 text-center">
          <CatWithCamera size={90} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted mb-1">No photos yet</p>
          <p className="text-xs text-muted">Add photos of Merry & Pippin!</p>
          {isAdmin && <button onClick={() => setShowUpload(true)} className="mt-4 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md">Add First Photo</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map(photo => {
            const cat = cats.find(c => c.id === photo.cat_id);
            return (
              <button key={photo.id} onClick={() => setSelectedPhoto(photo)} className="relative aspect-square rounded-xl overflow-hidden bg-golden-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption ?? ""} className="w-full h-full object-cover" />
                {(photo.caption || cat) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-[10px] truncate">{photo.caption ?? cat?.name}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 overlay z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="absolute top-12 right-4 flex gap-2">
            {isAdmin && <button onClick={() => handleDelete(selectedPhoto.id)} className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center"><Trash2 size={16} className="text-white" /></button>}
            <button onClick={() => setSelectedPhoto(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><X size={18} className="text-white" /></button>
          </div>
          <div className="max-w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto.url} alt={selectedPhoto.caption ?? ""} className="max-w-full max-h-[70vh] rounded-2xl object-contain" />
            {selectedPhoto.caption && <p className="text-white text-center mt-3 text-sm">{selectedPhoto.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
