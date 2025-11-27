import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Enhanced 3D Prism Component using Three.js
 * Creates a realistic, animated prism that refracts light
 */
function PrismMesh({ position = [0, 0, 0] }) {
  const meshRef = useRef();

  // Rotate the prism continuously
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  // Create prism geometry (hexagonal prism)
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 1;
    
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: 2,
      bevelEnabled: false,
    });
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <MeshDistortMaterial
        color="#8B5CF6"
        transparent
        opacity={0.8}
        distort={0.3}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
      {/* Spectrum colors on faces */}
      <meshStandardMaterial
        attach="material"
        color="#8B5CF6"
        transparent
        opacity={0.6}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

/**
 * Light rays refracting from the prism
 */
function LightRays({ count = 8 }) {
  const rays = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 3;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        z: Math.sin(i) * 0.5,
        color: [
          '#8B5CF6', // violet
          '#6366F1', // indigo
          '#3B82F6', // blue
          '#06B6D4', // cyan
          '#14B8A6', // teal
          '#10B981', // green
          '#F59E0B', // yellow
          '#EC4899', // pink
        ][i % 8],
      };
    });
  }, [count]);

  return (
    <>
      {rays.map((ray, i) => (
        <mesh key={i} position={[ray.x, ray.y, ray.z]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial
            color={ray.color}
            emissive={ray.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Main Prism3D Component with Three.js
 */
const Prism3DThree = ({ size = 'lg', autoRotate = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Ambient light */}
        <ambientLight intensity={0.5} />
        
        {/* Directional lights for spectrum effect */}
        <directionalLight position={[5, 5, 5]} intensity={1} color="#8B5CF6" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#3B82F6" />
        <pointLight position={[0, 0, 5]} intensity={1} color="#06B6D4" />
        
        {/* Prism mesh */}
        <PrismMesh />
        
        {/* Light rays */}
        <LightRays count={8} />
        
        {/* Camera controls */}
        {autoRotate && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}
      </Canvas>
      
      {/* Glow effect overlay */}
      <div className="absolute inset-0 bg-prism-gradient rounded-full opacity-20 blur-2xl animate-prism-glow pointer-events-none"></div>
    </div>
  );
};

export default Prism3DThree;






