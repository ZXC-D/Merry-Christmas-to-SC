import { ThreeElements } from '@react-three/fiber';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  scatterPos: [number, number, number];
  treePos: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
  speed: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
