export default function Background() {
  return (
    // ✅ 1. Add a parent container for the entire background.
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 2. The grid pattern can stay as is. */}
      <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* 3. The animated blobs are now children of the overflow-hidden container. */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
    </div>
  );
}
