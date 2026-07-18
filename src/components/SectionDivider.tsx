/**
 * SectionDivider — un arc de cercle discret entre les sections,
 * écho du motif des anneaux plutôt qu'un simple trait droit.
 */
export default function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="w-full h-[36px] md:h-[48px]"
      >
        <path
          d="M0,30 C300,0 900,60 1200,30"
          fill="none"
          stroke="var(--color-gold)"
          strokeOpacity="0.4"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
