import { useEffect, useRef } from 'react';

/**
 * Animated 3D Prism Component
 * Uses CSS 3D transforms to create a rotating prism effect
 * Represents the core metaphor: light entering and refracting into a spectrum
 */
const Prism3D = ({ size = 'lg', className = '' }) => {
  const prismRef = useRef(null);
  const faceRefs = useRef([]);

  useEffect(() => {
    // Create subtle parallax effect on mouse move
    const handleMouseMove = (e) => {
      if (!prismRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xRotation = ((clientY - innerHeight / 2) / innerHeight) * 20;
      const yRotation = ((clientX - innerWidth / 2) / innerWidth) * 20;
      
      prismRef.current.style.transform = `
        rotateY(${yRotation}deg) 
        rotateX(${xRotation}deg)
        translateZ(0)
      `;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
  };

  // Prism faces with spectrum colors
  const faces = [
    { color: 'from-prism-violet to-prism-indigo', rotate: 'rotateY(0deg) translateZ(50px)' },
    { color: 'from-prism-indigo to-prism-blue', rotate: 'rotateY(60deg) translateZ(50px)' },
    { color: 'from-prism-blue to-prism-cyan', rotate: 'rotateY(120deg) translateZ(50px)' },
    { color: 'from-prism-cyan to-prism-teal', rotate: 'rotateY(180deg) translateZ(50px)' },
    { color: 'from-prism-teal to-prism-green', rotate: 'rotateY(240deg) translateZ(50px)' },
    { color: 'from-prism-green to-prism-violet', rotate: 'rotateY(300deg) translateZ(50px)' },
  ];

  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      <div
        ref={prismRef}
        className={`${sizeClasses[size]} relative mx-auto animate-prism-rotate`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Prism faces */}
        {faces.map((face, index) => (
          <div
            key={index}
            ref={(el) => (faceRefs.current[index] = el)}
            className={`absolute inset-0 bg-gradient-to-br ${face.color} 
                       opacity-80 backdrop-blur-sm border border-white/20
                       animate-prism-glow`}
            style={{
              transform: face.rotate,
              transformStyle: 'preserve-3d',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            }}
          />
        ))}
        
        {/* Center glow effect */}
        <div
          className="absolute inset-0 bg-prism-gradient rounded-full opacity-30 blur-2xl"
          style={{
            transform: 'translateZ(-30px)',
          }}
        />
      </div>
      
      {/* Refracted light rays effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute w-1 h-20 bg-prism-gradient opacity-40 animate-float"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 72}deg) translateY(-100px)`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Prism3D;






