import { motion } from "framer-motion";

/**
 * BreathingOrb — l'élément signature du site.
 * Trois anneaux concentriques qui se dilatent et se contractent
 * lentement, au rythme d'une respiration calme (≈ 6s par cycle).
 * Représente le retour au centre, l'énergie et la présence,
 * sans recourir aux clichés visuels (mandala, lotus, etc.).
 */
export default function BreathingOrb({ className = "" }: { className?: string }) {
  const breathe = (delay: number, scaleTo: number) => ({
    initial: { scale: 1, opacity: 0.9 },
    animate: { scale: [1, scaleTo, 1], opacity: [0.9, 1, 0.9] },
    transition: {
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  });

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        role="img"
        aria-label="Symbole de respiration : anneaux concentriques"
      >
        <motion.circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="1"
          strokeOpacity="0.35"
          {...breathe(0, 1.045)}
          style={{ transformOrigin: "200px 200px" }}
        />
        <motion.circle
          cx="200"
          cy="200"
          r="112"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1"
          strokeOpacity="0.45"
          {...breathe(0.4, 1.06)}
          style={{ transformOrigin: "200px 200px" }}
        />
        <motion.circle
          cx="200"
          cy="200"
          r="74"
          fill="var(--color-sand)"
          fillOpacity="0.5"
          stroke="var(--color-wood)"
          strokeWidth="1"
          strokeOpacity="0.5"
          {...breathe(0.8, 1.08)}
          style={{ transformOrigin: "200px 200px" }}
        />
        <motion.circle
          cx="200"
          cy="200"
          r="8"
          fill="var(--color-wood-deep)"
          {...breathe(0.8, 1.2)}
          style={{ transformOrigin: "200px 200px" }}
        />
      </svg>
    </div>
  );
}
