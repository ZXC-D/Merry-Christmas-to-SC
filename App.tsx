import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { ImageViewer } from './components/ImageViewer';
import { TreeMorphState } from './types';

// 尝试使用绝对路径引用根目录下的文件
const LOCAL_MUSIC_PATH = "/music.mp3";

// Default Photo
const DEFAULT_PHOTO_URL = "https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=600&auto=format&fit=crop"; 

// Music Sources (Priority Order)
const MUSIC_SOURCES = [
    // 1. 优先使用本地文件 (根目录)
    LOCAL_MUSIC_PATH,
    
    // 2. 备用: Pixabay (CDN)
    "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3",
    
    // 3. 备用: Archive.org
    "https://archive.org/download/Kevin_MacLeod_-_Jingle_Bells/Jingle_Bells.mp3",
];

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.TREE_SHAPE);
  const [photoUrls, setPhotoUrls] = useState<string[]>([DEFAULT_PHOTO_URL]);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  
  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [customMusicUrl, setCustomMusicUrl] = useState<string | null>(null); // New: Store user uploaded music
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup previous audio if it exists to prevent overlap
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }

    // Initialize Audio
    const audio = new Audio();
    
    // Logic: If user uploaded music, use it. Otherwise use the source list.
    if (customMusicUrl) {
        audio.src = customMusicUrl;
    } else {
        audio.src = MUSIC_SOURCES[currentSourceIndex];
    }
    
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto'; 

    // Error handling
    const handleError = (e: Event) => {
        // If it's custom music, we don't skip to backup, just log error
        if (customMusicUrl) {
            console.error("Custom music failed to load");
            setIsMusicPlaying(false);
            return;
        }

        const target = e.target as HTMLAudioElement;
        console.warn(`Audio Source ${currentSourceIndex} Failed (${target.src}). Switching to backup...`);

        // Try next source if available
        if (currentSourceIndex < MUSIC_SOURCES.length - 1) {
            setCurrentSourceIndex(prev => prev + 1);
        } else {
            console.error("All audio sources failed.");
            setIsMusicPlaying(false);
        }
    };

    const handleCanPlay = () => {
        // Audio is ready to play
        // If we just swapped sources or uploaded new music, we might want to ensure it plays if it was playing before
        if (isMusicPlaying) {
             audio.play().catch(e => console.log("Autoplay blocked", e));
        }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audioRef.current = null;
    };
  }, [currentSourceIndex, customMusicUrl]); 

  // Watch isMusicPlaying to trigger play/pause on the current audio instance
  useEffect(() => {
      if (!audioRef.current) return;
      if (isMusicPlaying) {
          audioRef.current.play().catch(e => {
              console.error("Playback failed:", e);
              setIsMusicPlaying(false);
          });
      } else {
          audioRef.current.pause();
      }
  }, [isMusicPlaying]);

  const toggleMusic = () => {
    setIsMusicPlaying(prev => !prev);
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
          const file = files[0];
          const objectUrl = URL.createObjectURL(file);
          setCustomMusicUrl(objectUrl);
          setIsMusicPlaying(true); // Auto play new music
          // Reset source index so if they revert it starts fresh (optional)
          setCurrentSourceIndex(0);
      }
  };

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeMorphState.TREE_SHAPE 
        ? TreeMorphState.SCATTERED 
        : TreeMorphState.TREE_SHAPE
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file as Blob));
      setPhotoUrls(newUrls);
    }
  };

  const handlePhotoClick = (url: string) => {
    setViewingPhoto(url);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      photoUrls.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
      if (customMusicUrl && customMusicUrl.startsWith('blob:')) URL.revokeObjectURL(customMusicUrl);
    };
  }, [photoUrls, customMusicUrl]);

  return (
    <div className="relative w-full h-screen bg-[#011812] overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-[#FCD34D] tracking-widest animate-pulse z-50 font-serif">
          PREPARING SURPRISE...
        </div>
      }>
        <Scene 
            treeState={treeState} 
            photoUrls={photoUrls} 
            onPhotoClick={handlePhotoClick}
        />
      </Suspense>
      
      <Overlay 
        currentState={treeState} 
        onToggle={toggleState} 
        onPhotoUpload={handlePhotoUpload} 
        onMusicUpload={handleMusicUpload}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
      />

      <ImageViewer 
        photoUrl={viewingPhoto} 
        onClose={() => setViewingPhoto(null)} 
      />
    </div>
  );
};

export default App;