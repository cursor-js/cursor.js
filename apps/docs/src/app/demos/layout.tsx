export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex items-center justify-center w-[125%] h-[125%] origin-top-left scale-[0.8] min-h-[125vh] overflow-hidden m-0 p-0">
      {children}
    </div>
  );
}
