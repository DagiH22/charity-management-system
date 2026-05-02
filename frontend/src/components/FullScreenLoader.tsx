type FullScreenLoaderProps = {
  message?: string;
};

export default function FullScreenLoader({ message = "Loading..." }: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <p className="text-sm font-semibold text-slate-600">{message}</p>
    </div>
  );
}