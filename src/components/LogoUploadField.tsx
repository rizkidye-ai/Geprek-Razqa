"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function LogoUploadField({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [markRemove, setMarkRemove] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMarkRemove(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Logo Toko</label>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {preview && !markRemove ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo toko" className="h-full w-full object-contain" />
          ) : (
            <ImageOff size={20} className="text-gray-300" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <p className="text-xs text-gray-400">PNG/JPG, maks. 1MB. Muncul di struk & sidebar.</p>
          {currentLogoUrl && (
            <label className="flex items-center gap-1.5 text-xs text-red-500">
              <input
                type="checkbox"
                name="removeLogo"
                checked={markRemove}
                onChange={(e) => {
                  setMarkRemove(e.target.checked);
                  if (e.target.checked) setPreview(null);
                }}
              />
              Hapus logo saat ini
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
