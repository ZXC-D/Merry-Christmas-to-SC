import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';

interface TopStarProps {
  treeState: TreeMorphState;
}

export const TopStar: React.FC<TopStarProps> = ({ treeState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a 5-pointed star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.8; // BIG size
    const innerRadius = 0.8;
    
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2;
        // Rotate -Math.PI/2 to make it point up
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const x = Math.cos(angle - Math.PI / 2) * r;
        const y = Math.sin(angle - Math.PI / 2) * r;
        
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  const visible = treeState === TreeMorphState.TREE_SHAPE;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Gentle floating - Lowered base height from 6.5 to 5.8
    meshRef.current.position.y = 1.5 + Math.sin(time * 1.5) * 0.1;
    // Slow spin
    meshRef.current.rotation.y = time * 0.5;
    
    // Scale animation for entrance
    const targetScale = visible ? 0.5 : 0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
  });

  return (
    <group position={[0, 5.8, 0]}>
        <mesh ref={meshRef} geometry={starGeometry}>
          <meshStandardMaterial 
            color="#FCD34D" 
            emissive="#FFD700" 
            emissiveIntensity={4} 
            toneMapped={false}
            roughness={0}
            metalness={1}
          />
        </mesh>
        {/* Additional Glow Sprite */}
        {visible && (
            <pointLight distance={15} intensity={5} color="#FFD700" />
        )}
    </group>
  );
};