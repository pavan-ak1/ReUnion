export default function GlowDivider({ color = "via-cyan-400" }) {
  return (
    <div className="relative w-full h-[3px] mb-2 mt-25">
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${color}/80 to-transparent blur-sm`} />
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${color} to-transparent`} />
    </div>
  );
}
