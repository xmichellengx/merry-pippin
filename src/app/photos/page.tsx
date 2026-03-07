"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Plus, Camera, Image as ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { mockCats } from "@/lib/mock-data";

type PhotoItem = {
  id: string;
  catName: string;
  url: string;
  caption: string;
};

// Placeholder photos - will be replaced with real uploads
const placeholderPhotos: PhotoItem[] = [
  { id: "1", catName: "Merry", url: "", caption: "Merry lounging in the sun" },
  { id: "2", catName: "Pippin", url: "", caption: "Pippin being curious" },
  { id: "3", catName: "Both", url: "", caption: "Cuddle time!" },
];

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>(placeholderPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setPhotos(prev => [
        {
          id: Date.now().toString() + Math.random(),
          catName: "Merry",
          url,
          caption: "",
        },
        ...prev,
      ]);
    });
    setShowUpload(false);
  };

  return (
    <div className="px-4 pt-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-golden-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-golden-700" />
          </Link>
          <h1 className="text-lg font-bold">Photo Gallery</h1>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="w-9 h-9 rounded-full golden-gradient flex items-center justify-center shadow-md"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="card p-4 space-y-3 border-golden-300 border-2">
          <h3 className="font-semibold text-sm">Add Photos</h3>
          <p className="text-xs text-muted">Upload from your camera roll (iCloud photos sync automatically on iPhone)</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="card p-4 text-center card-hover"
            >
              <ImageIcon size={24} className="text-golden-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Photo Library</p>
            </button>
            <button
              onClick={() => {
                // On mobile, this will open the camera
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute("capture", "environment");
                  fileInputRef.current.click();
                  fileInputRef.current.removeAttribute("capture");
                }
              }}
              className="card p-4 text-center card-hover"
            >
              <Camera size={24} className="text-golden-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Take Photo</p>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div>
            <label className="text-xs text-muted block mb-1">Which cat?</label>
            <select defaultValue="both">
              <option value="both">Both</option>
              {mockCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowUpload(false)}
            className="w-full py-2 rounded-xl bg-golden-50 text-golden-700 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="card p-8 text-center">
          <Camera size={40} className="text-muted mx-auto mb-3" />
          <p className="text-sm text-muted mb-1">No photos yet</p>
          <p className="text-xs text-muted">Add photos of Merry & Pippin!</p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 px-4 py-2 rounded-xl golden-gradient text-white text-sm font-medium shadow-md"
          >
            Add First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-xl overflow-hidden bg-golden-100"
            >
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <div className="w-12 h-12 rounded-full golden-gradient flex items-center justify-center">
                    <span className="text-white font-bold">{photo.catName[0]}</span>
                  </div>
                  <span className="text-[10px] text-muted">{photo.catName}</span>
                </div>
              )}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-[10px] truncate">{photo.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Photo viewer overlay */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 overlay z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-12 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={18} className="text-white" />
          </button>
          <div className="max-w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
            {selectedPhoto.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-[70vh] rounded-2xl object-contain"
              />
            ) : (
              <div className="w-64 h-64 rounded-2xl bg-golden-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full golden-gradient flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-2xl">{selectedPhoto.catName[0]}</span>
                  </div>
                  <p className="text-sm font-medium">{selectedPhoto.catName}</p>
                </div>
              </div>
            )}
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-3 text-sm">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
