"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FileText } from "lucide-react"

// Pre-generate static seeds for paper positions based on index
const getStaticPosition = (index: number) => {
  // Use deterministic positions based on index
  const positions = [
    { x: 100, y: 100 },
    { x: 300, y: 200 },
    { x: 500, y: 300 },
    { x: 700, y: 150 },
    { x: 900, y: 250 },
    { x: 200, y: 400 },
    { x: 400, y: 500 },
    { x: 600, y: 600 },
    { x: 800, y: 450 },
    { x: 1000, y: 550 },
  ];
  
  // Use modulo to handle any number of papers
  return positions[index % positions.length];
};

export function FloatingPaper({ count = 5 }) {
  const [mounted, setMounted] = useState(false);
  
  // Only enable animations after component has mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Only render papers on the client side to avoid hydration errors
  if (!mounted) {
    // Return placeholder with same structure for SEO/initial render
    return <div className="relative w-full h-full" />;
  }
  
  return (
    <div className="relative w-full h-full">
      {Array.from({ length: count }).map((_, i) => {
        const initialPos = getStaticPosition(i);
        
        // Only generate random positions after mount
        const xPositions = [
          Math.random() * window.innerWidth * 0.8,
          Math.random() * window.innerWidth * 0.8,
          Math.random() * window.innerWidth * 0.8
        ];
        
        const yPositions = [
          Math.random() * window.innerHeight * 0.6,
          Math.random() * window.innerHeight * 0.6,
          Math.random() * window.innerHeight * 0.6
        ];
        
        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: initialPos.x,
              y: initialPos.y,
              opacity: 0
            }}
            animate={{
              x: xPositions,
              y: yPositions,
              opacity: 1,
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + (i * 2),
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          >
            <div className="relative w-16 h-20 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform">
              <FileText className="w-8 h-8 text-purple-400/50" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
