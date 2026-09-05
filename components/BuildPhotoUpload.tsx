
"use client";

import { Image, upload } from "@imagekit/next";
import { useRef, useState } from "react";

interface BuildPhotoUploadProps {
  onUploadSuccess: (url: string) => void;
}

export function BuildPhotoUpload({ onUploadSuccess }: BuildPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const authRes = await fetch("/api/imagekit-auth");
      const auth = await authRes.json();

      const result = await upload({
        file,
        fileName: file.name,
        publicKey: auth.publicKey,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        folder: "/build-photography",
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        onProgress: (event) => {
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      setPreviewUrl(result.url ?? null);
      onUploadSuccess(result.url!);
    } catch (err) {
      console.error("ImageKit upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold uppercase text-[#4E4A42]">
       click to select a photo
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="block w-full text-sm text-[#5C5750] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#16171C] file:text-white file:text-sm"
      />

      {isUploading && (
        <div className="w-full bg-[#E5E2DA] rounded-full h-2">
          <div
            className="bg-[#2A2724] h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {previewUrl && (
        <img
          src={previewUrl}
          alt="Upload preview"
          className="w-32 h-32 object-cover rounded-md border border-[#E5E2DA]"
        />
      )}
    </div>
  );
}