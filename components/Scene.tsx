import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { PhotoParticles } from './PhotoParticles';
import { SpiralStars } from './SpiralStars';
import { TopStar } from './TopStar';
import { TreeMorphState } from '../types';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeMorphState;
  photoUrls: string[];
  onPhotoClick: (url: string) => void;
}

const Rig = ({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) => {
    useFrame((state) => {
        if (!groupRef.current) return;
        const x = state.pointer.x * 0.2;
        const y = state.pointer.y * 0.1;
        
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y, 0.05);
    })
    return null
}

export const Scene: React.FC<SceneProps> = ({ treeState, photoUrls, onPhotoClick }) => {
  const contentGroupRef = useRef<THREE.Group>(null);

  return (
    <Canvas
      dpr={[1, 2]} // Quality scaling
      gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      shadows
      className="w-full h-full bg-[#00100c]"
    >
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={45} />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#059669" />
      <spotLight
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#FCD34D"
        castShadow
      />
      <pointLight position={[-10, -5, -10]} intensity={2} color="#047857" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#FFD700" distance={10} />

      {/* Environment reflections */}
      <Environment preset="city" />

      {/* Dynamic movement applied to the content group */}
      <Rig groupRef={contentGroupRef} />

      {/* The Core Content - Wrapped in a group for the Rig to animate */}
      <group ref={contentGroupRef} position={[0, -1.5, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <TreeParticles treeState={treeState} />
            <PhotoParticles 
                treeState={treeState} 
                photoUrls={photoUrls} 
                onPhotoClick={onPhotoClick}
            />
            <SpiralStars treeState={treeState} />
            <TopStar treeState={treeState} />
        </Float>
      </group>

      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Post Processing for the "Luxury" Bloom */}
      <EffectComposer enableNormalPass={false}>
        <Bloom 
            luminanceThreshold={1.2}
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
      
      {/* Orbit allows user to explore */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};