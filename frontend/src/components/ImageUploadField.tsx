import { useCallback, useMemo, useRef, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  description?: string;
  helperText?: string;
  accept?: string;
  previewUrl?: string | null;
  isUploading?: boolean;
  uploadProgress?: number | null;
  error?: string | null;
  onFileSelect: (file: File | null) => void;
  onRemove?: () => void;
  variant?: "logo" | "banner";
};

export default function ImageUploadField({
  label,
  description,
  helperText,
  accept = "image/jpeg,image/png,image/webp",
  previewUrl,
  isUploading = false,
  uploadProgress,
  error,
  onFileSelect,
  onRemove,
  variant = "banner",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleFiles = useCallback(
    (files?: FileList | null) => {
      const file = files?.[0] ?? null;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const dropStyles = useMemo(() => {
    if (isDragging) {
      return "border-emerald-400 bg-emerald-50";
    }
    if (error) {
      return "border-rose-300 bg-rose-50/40";
    }
    return "border-slate-200 bg-slate-50/60";
  }, [error, isDragging]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {onRemove && previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-rose-600 hover:text-rose-500"
          >
            Remove
          </button>
        )}
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}

      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-5 transition ${dropStyles} ${
          variant === "banner" ? "min-h-[220px]" : "min-h-[160px]"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          <div className="flex w-full flex-col items-center gap-4">
            <div
              className={`overflow-hidden rounded-2xl bg-white shadow-sm ${
                variant === "banner" ? "w-full" : "h-28 w-28 rounded-full"
              }`}
            >
              <img
                src={previewUrl}
                alt="Selected preview"
                className={
                  variant === "banner"
                    ? "h-52 w-full object-cover"
                    : "h-28 w-28 object-cover"
                }
              />
            </div>
            <button
              type="button"
              onClick={handleBrowse}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Drag and drop or click to upload
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {helperText || "JPG, PNG, or WEBP up to 5MB"}
            </p>
            <button
              type="button"
              onClick={handleBrowse}
              className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Browse Files
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />
      </div>

      {isUploading && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          Uploading... {uploadProgress ? `${uploadProgress}%` : ""}
        </div>
      )}

      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
