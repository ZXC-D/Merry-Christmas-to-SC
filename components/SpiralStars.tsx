import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { generateSpiralData } from '../utils/geometry';

interface SpiralStarsProps {
  treeState: TreeMorphState;
}

const COUNT = 800;

export const SpiralStars: React.FC<SpiralStarsProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => generateSpiralData(COUNT, 13, 5), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const progressRef = useRef(0);
  const targetProgress = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Transition Logic
    const step = delta * 1.0; // Slower transition for galaxy
    if (progressRef.current < targetProgress) {
      progressRef.current = Math.min(progressRef.current + step, targetProgress);
    } else if (progressRef.current > targetProgress) {
      progressRef.current = Math.max(progressRef.current - step, targetProgress);
    }
    
    const t = progressRef.current;
    const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      const x = THREE.MathUtils.lerp(particle.scatterPos[0], particle.treePos[0], easedT);
      const y = THREE.MathUtils.lerp(particle.scatterPos[1], particle.treePos[1], easedT);
      const z = THREE.MathUtils.lerp(particle.scatterPos[2], particle.treePos[2], easedT);

      // Animation: Flow upwards along spiral when formed
      const flowOffset = t > 0.8 ? (time * 0.5 + i * 0.01) % (Math.PI * 2) : 0;
      const flowY = t > 0.8 ? Math.sin(flowOffset) * 0.2 : 0;

      dummy.position.set(x, y + flowY, z);
      
      // Rotate the whole spiral slowly around Y when formed
      if (t > 0.5) {
          const orbitSpeed = 0.2;
          const angle = time * orbitSpeed;
          const px = dummy.position.x;
          const pz = dummy.position.z;
          dummy.position.x = px * Math.cos(angle) - pz * Math.sin(angle);
          dummy.position.z = px * Math.sin(angle) + pz * Math.cos(angle);
      }

      dummy.scale.setScalar(particle.scale * (1 + Math.sin(time * 3 + i) * 0.5)); // Twinkle
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      {/* Silver White Material */}
      <meshStandardMaterial 
        color="#E2E8F0" 
        emissive="#FFFFFF"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};