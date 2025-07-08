import React, { useEffect, useState } from 'react';

const PoopConfetti = ({ isActive }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      // Clear any existing particles
      setParticles([]);
      
      // Create new particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        size: 20 + Math.random() * 20,
        swayAmount: 15 + Math.random() * 15
      }));
      
      setParticles(newParticles);
      
      // Clear particles after animation completes
      const maxDuration = Math.max(...newParticles.map(p => p.delay + p.duration));
      const timeout = setTimeout(() => {
        setParticles([]);
      }, maxDuration * 1000);
      
      return () => clearTimeout(timeout);
    } else {
      // Clear immediately when isActive becomes false
      setParticles([]);
    }
  }, [isActive]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-fall"
          style={{
            left: `${particle.x}%`,
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--sway-amount': `${particle.swayAmount}px`
          }}
        >
          💩
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) translateX(var(--sway-amount)) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default PoopConfetti;
