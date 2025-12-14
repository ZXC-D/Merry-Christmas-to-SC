import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { generateParticleData } from '../utils/geometry';

interface TreeParticlesProps {
  treeState: TreeMorphState;
}

const PARTICLE_COUNT = 4000;

export const TreeParticles: React.FC<TreeParticlesProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { particles, colors } = useMemo(() => {
    const data = generateParticleData(PARTICLE_COUNT);
    const colorArray = new Float32Array(PARTICLE_COUNT * 3);
    const c = new THREE.Color();
    
    data.forEach((p, i) => {
      c.set(p.color);
      // Boost emissivity for gold particles
      if (p.isOrnament) c.multiplyScalar(2.5); 
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    });

    return { particles: data, colors: colorArray };
  }, []);

  // Animation progress: 0 = SCATTERED, 1 = TREE
  const progressRef = useRef(0);
  const targetProgress = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
  
  // Temp matrix for updates
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly interpolate progress
    const step = delta * 1.5; // Speed of transition
    if (progressRef.current < targetProgress) {
      progressRef.current = Math.min(progressRef.current + step, targetProgress);
    } else if (progressRef.current > targetProgress) {
      progressRef.current = Math.max(progressRef.current - step, targetProgress);
    }

    const t = progressRef.current;
    // Easing function for smoother motion (Ease In Out Quad)
    const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    particles.forEach((particle, i) => {
      // Interpolate positions
      const x = THREE.MathUtils.lerp(particle.scatterPos[0], particle.treePos[0], easedT);
      const y = THREE.MathUtils.lerp(particle.scatterPos[1], particle.treePos[1], easedT);
      const z = THREE.MathUtils.lerp(particle.scatterPos[2], particle.treePos[2], easedT);

      // Add a slight floating wobble based on time
      const time = state.clock.getElapsedTime();
      const wobble = Math.sin(time * particle.speed + i) * 0.1;
      
      // Rotate particles (spin faster when scattered)
      dummy.position.set(x, y + wobble, z);
      dummy.rotation.set(
        particle.rotation[0] + time * 0.2,
        particle.rotation[1] + time * 0.1,
        particle.rotation[2]
      );
      dummy.scale.setScalar(particle.scale * (0.8 + 0.2 * Math.sin(time * 2 + i)));
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, PARTICLE_COUNT]}
      castShadow
      receiveShadow
    >
      {/* A low-poly icosahedron looks like a crystal/ornament */}
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        toneMapped={false}
        roughness={0.15}
        metalness={0.9}
        vertexColors // Essential for individual colors
      />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colors, 3]}
      />
    </instancedMesh>
  );
};
