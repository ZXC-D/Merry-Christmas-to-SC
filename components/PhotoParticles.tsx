import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { generatePhotoData } from '../utils/geometry';

interface PhotoParticlesProps {
  treeState: TreeMorphState;
  photoUrls: string[];
  onPhotoClick: (url: string) => void;
}

const PHOTO_COUNT = 30; // Number of photos in the tree

// Helper component to render a SINGLE photo instance
const PhotoMesh = React.forwardRef<
  THREE.Mesh, 
  { url: string; onClick: () => void }
>(({ url, onClick }, ref) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'Anonymous';
    let active = true;

    loader.load(url, (tex) => {
      if (!active) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });

    return () => { active = false; };
  }, [url]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; }
  }, [hovered]);

  return (
    <mesh 
        ref={ref}
        onClick={(e) => {
            e.stopPropagation();
            if (texture) onClick();
        }}
        onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
        }}
        onPointerOut={() => {
            setHovered(false);
        }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        transparent={true}
        opacity={texture ? 1 : 0} 
        toneMapped={false}
        color={hovered ? "#ffffee" : "#ffffff"} // Slight highlight on hover
      />
    </mesh>
  );
});

export const PhotoParticles: React.FC<PhotoParticlesProps> = ({ treeState, photoUrls, onPhotoClick }) => {
  const frameMeshRef = useRef<THREE.InstancedMesh>(null);
  // Store refs to individual photo meshes
  const photoRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Initialize data
  const particles = useMemo(() => generatePhotoData(PHOTO_COUNT), []);
  
  const progressRef = useRef(0);
  const targetProgress = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!frameMeshRef.current) return;

    // Animation transition logic
    const step = delta * 1.5;
    if (progressRef.current < targetProgress) {
      progressRef.current = Math.min(progressRef.current + step, targetProgress);
    } else if (progressRef.current > targetProgress) {
      progressRef.current = Math.max(progressRef.current - step, targetProgress);
    }

    const t = progressRef.current;
    const easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Interpolate positions
      const x = THREE.MathUtils.lerp(particle.scatterPos[0], particle.treePos[0], easedT);
      const y = THREE.MathUtils.lerp(particle.scatterPos[1], particle.treePos[1], easedT);
      const z = THREE.MathUtils.lerp(particle.scatterPos[2], particle.treePos[2], easedT);

      // Add gentle floating
      const wobbleY = Math.sin(time * particle.speed + i) * 0.2;
      
      dummy.position.set(x, y + wobbleY, z);

      // Rotation logic
      if (t > 0.8) {
        dummy.rotation.set(
            particle.rotation[0] + Math.sin(time * 0.5) * 0.05,
            particle.rotation[1] + Math.sin(time * 0.3) * 0.05,
            particle.rotation[2] + Math.sin(time * 0.4) * 0.05
        );
      } else {
        dummy.rotation.set(
            particle.rotation[0] + time * 0.5,
            particle.rotation[1] + time * 0.3,
            time * 0.2
        );
      }
      
      // Scale
      const baseScale = 0.8; 
      dummy.scale.setScalar(baseScale * (treeState === TreeMorphState.SCATTERED ? 0.8 : 1));

      dummy.updateMatrix();
      
      // 1. Update the InstancedMesh for the Frame
      frameMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // 2. Update the Individual Mesh for the Photo
      const photoMesh = photoRefs.current[i];
      if (photoMesh) {
         photoMesh.position.copy(dummy.position);
         photoMesh.rotation.copy(dummy.rotation);
         photoMesh.scale.copy(dummy.scale);
         // Apply local offset for the photo to sit on the frame
         photoMesh.translateZ(0.04);
      }
    });

    frameMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* 1. The White Polaroid Frames (Instanced for performance) */}
      <instancedMesh
        ref={frameMeshRef}
        args={[undefined, undefined, PHOTO_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.2, 1.5, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </instancedMesh>

      {/* 2. Individual Photo Meshes (to allow unique textures and interaction) */}
      <group>
        {particles.map((_, i) => {
            const currentUrl = photoUrls.length > 0 ? photoUrls[i % photoUrls.length] : "";
            return (
                <PhotoMesh 
                    key={i} 
                    ref={(el) => { photoRefs.current[i] = el; }}
                    url={currentUrl}
                    onClick={() => onPhotoClick(currentUrl)}
                />
            );
        })}
      </group>
    </group>
  );
};
