export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center w-28 h-28">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        <div className="flex flex-col items-center justify-center font-black tracking-tighter text-center">
          <span className="text-emerald-500 text-sm drop-shadow">HITSHAB</span>
          <span className="text-[9px] uppercase opacity-75 text-slate-300">Transport</span>
        </div>
      </div>
      <p className="mt-4 text-xs font-bold tracking-widest uppercase text-slate-300 animate-pulse">
        Memuat Halaman...
      </p>
    </div>
  );
}