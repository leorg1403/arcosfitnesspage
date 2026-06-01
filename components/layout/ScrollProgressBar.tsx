"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.5,
  });

  // El wrapper fixed NO lleva background: Safari 26 muestrea el bg de elementos
  // fixed cerca del borde superior para teñir la status bar. La barra dorada va
  // como hijo position:absolute (que Safari ignora al teñir), así no pinta la
  // barra de estado de dorado.
  return (
    <div
      aria-hidden
      className="fixed top-0 inset-x-0 h-[1.5px] z-50 pointer-events-none"
    >
      <motion.div
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="absolute inset-0 bg-gold"
      />
    </div>
  );
}
