import * as THREE from 'three';

// Helper to generate a random point inside a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius; // Cubic root for uniform distribution
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi),
  ];
};

// Helper to generate a point on a volumetric cone (The Tree)
export const getTreePoint = (height: number, maxRadius: number, index: number, total: number): [number, number, number] => {
  // Normalized height (0 at bottom, 1 at top)
  // We use a spiral distribution for better aesthetics
  const yRatio = index / total; 
  const y = (yRatio - 0.5) * height; // Centered vertically
  
  // Radius decreases as we go up
  const currentRadius = (1 - yRatio) * maxRadius;
  
  // Golden Angle for spiral distribution
  const angle = index * 2.39996; // Golden angle in radians approx
  
  // Add some randomness to "volume" not just surface
  const rRandom = Math.sqrt(Math.random()) * currentRadius;
  
  const x = Math.cos(angle) * rRandom;
  const z = Math.sin(angle) * rRandom;

  return [x, y, z];
};

// NEW: Helper to generate a point ON THE SURFACE of the cone (for Photos)
export const getTreeSurfacePoint = (height: number, maxRadius: number, index: number, total: number): [number, number, number] => {
  const yRatio = index / total; 
  const y = (yRatio - 0.5) * height;
  const currentRadius = (1 - yRatio) * maxRadius;
  
  // Use a different angle multiplier to desync from main particles
  const angle = index * 5.5; 
  
  // Place exactly on the radius (Surface)
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;

  return [x, y, z];
};

// NEW: Generate Spiral Galaxy Data
export const generateSpiralData = (count: number, height: number, maxRadius: number): any[] => {
  const particles = [];
  const loops = 6; // How many times it wraps around
  
  for (let i = 0; i < count; i++) {
    const progress = i / count; // 0 to 1
    const y = (progress - 0.5) * height;
    
    // Radius slightly larger than the tree to float outside
    const currentTreeRadius = (1 - progress) * maxRadius;
    const spiralRadius = currentTreeRadius + 1.5 + Math.random() * 0.5; // Offset outwards
    
    const angle = progress * loops * Math.PI * 2;
    
    const x = Math.cos(angle) * spiralRadius;
    const z = Math.sin(angle) * spiralRadius;
    
    particles.push({
      scatterPos: getRandomSpherePoint(20), // Wider scatter
      treePos: [x, y, z],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.08 + 0.02,
      speed: Math.random() * 0.5 + 0.2,
    });
  }
  return particles;
};

export const generateParticleData = (count: number): any[] => {
  const particles = [];
  const palette = [
    '#059669', // Emerald 500
    '#047857', // Emerald 700
    '#FFD700', // Gold
    '#FCD34D', // Light Gold
    '#FFFFFF', // Sparkle White
  ];

  for (let i = 0; i < count; i++) {
    const isGold = Math.random() > 0.8;
    const color = isGold ? '#FFD700' : palette[Math.floor(Math.random() * palette.length)];
    
    // Base scale
    let scale = Math.random() * 0.15 + 0.05;
    if (isGold) scale *= 1.5; // Ornaments are bigger

    particles.push({
      scatterPos: getRandomSpherePoint(15), // Large scatter radius
      treePos: getTreePoint(12, 4.5, i, count),
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale,
      color,
      speed: Math.random() * 0.5 + 0.5, // Animation speed variance
      isOrnament: isGold
    });
  }
  return particles;
};

export const generatePhotoData = (count: number): any[] => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const treePos = getTreeSurfacePoint(12, 4.2, i, count);
    const lookAtPos = new THREE.Vector3(treePos[0], treePos[1], treePos[2]).normalize();
    const rotation = new THREE.Euler(0, Math.atan2(lookAtPos.x, lookAtPos.z), 0);

    particles.push({
      scatterPos: getRandomSpherePoint(18),
      treePos: treePos,
      rotation: [rotation.x, rotation.y, rotation.z],
      speed: Math.random() * 0.3 + 0.2,
    });
  }
  return particles;
};