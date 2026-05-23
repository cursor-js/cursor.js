export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-background flex h-full w-full items-stretch justify-stretch overflow-hidden">{children}</div>;
}
