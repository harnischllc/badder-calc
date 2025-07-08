import React, { useEffect, useState } from 'react';

const PoopConfetti = ({ isActive }) => {
  const [poops, setPoops] = useState([]);

  useEffect(() => {
    if (isActive) {
      const newPoops = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 3,
        animationDelay: Math.random() * 0.5,
        size: 20 + Math.random() * 20
      }));
      setPoops(newPoops);

      const timer = setTimeout(() => {
        setPoops([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (poops.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0.8;
          }
        }
        
        @keyframes sway {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(30px);
          }
        }
        
        .poop {
          position: absolute;
          animation: fall linear forwards, sway ease-in-out infinite;
          animation-duration: var(--duration), 2s;
          animation-delay: var(--delay), 0s;
        }
      `}</style>
      {poops.map((poop) => (
        <div
          key={poop.id}
          className="poop"
          style={{
            left: `${poop.left}%`,
            '--duration': `${poop.animationDuration}s`,
            '--delay': `${poop.animationDelay}s`,
            fontSize: `${poop.size}px`
          }}
        >
          💩
        </div>
      ))}
    </div>
  );
};

export default PoopConfetti;
