'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function HeroLoader() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#050505' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <style>{`
        .uiverse-loader {
          position: relative;
          width: 120px;
          height: 90px;
          margin: 0 auto;
        }

        .uiverse-loader:before {
          content: "";
          position: absolute;
          bottom: 30px;
          left: 50px;
          height: 30px;
          width: 30px;
          border-radius: 50%;
          background: #0ea5e9;
          animation: loading-bounce 0.5s ease-in-out infinite alternate;
        }

        .uiverse-loader:after {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          height: 7px;
          width: 45px;
          border-radius: 4px;
          box-shadow: 0 5px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 95px 0 #f2f2f2;
          animation: loading-step 1s ease-in-out infinite;
        }

        @keyframes loading-bounce {
          0% { transform: scale(1, 0.7); }
          40% { transform: scale(0.8, 1.2); }
          60% { transform: scale(1, 1); }
          100% { bottom: 140px; }
        }

        @keyframes loading-step {
          0% { box-shadow: 0 10px 0 rgba(0, 0, 0, 0), 0 10px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 90px 0 #f2f2f2; }
          100% { box-shadow: 0 10px 0 #f2f2f2, -35px 50px 0 #f2f2f2, -70px 90px 0 #f2f2f2, -70px 90px 0 rgba(0, 0, 0, 0); }
        }
      `}</style>
      
      <motion.div
        animate={{
          x: mousePos.x * 40,
          y: mousePos.y * 40,
          rotateX: mousePos.y * -15,
          rotateY: mousePos.x * 15,
        }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        style={{ perspective: 1000 }}
        className="flex flex-col items-center"
      >
        <div className="uiverse-loader" />
        <p className="mt-16 text-xs tracking-[0.3em] text-white/50 uppercase font-light">
          Initializing Engine
        </p>
      </motion.div>
    </motion.div>
  );
}
