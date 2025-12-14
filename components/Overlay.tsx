import React, { useRef } from 'react';
import { TreeMorphState } from '../types';
import { Sparkles, Heart, Camera, Volume2, VolumeX, Music } from 'lucide-react';

interface OverlayProps {
  currentState: TreeMorphState;
  onToggle: () => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMusicUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  currentState, 
  onToggle, 
  onPhotoUpload,
  onMusicUpload,
  isMusicPlaying,
  onToggleMusic
}) => {
  const isTree = currentState === TreeMorphState.TREE_SHAPE;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  const handlePolaroidClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onPhotoUpload} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />
      <input
        type="file"
        ref={musicInputRef}
        onChange={onMusicUpload}
        accept="audio/*"
        className="hidden"
      />

      {/* 1. Music Controls (Top Right) */}
      <div className="absolute top-8 right-8 md:top-12 md:right-12 flex items-center gap-3 pointer-events-auto z-50">
          
          {/* Upload Music Button */}
          <button
            onClick={() => musicInputRef.current?.click()}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-[#FCD34D]/30 text-[#FCD34D] hover:bg-[#FCD34D]/10 transition-all group"
            title="更换背景音乐 (Change Music)"
          >
             <Music size={20} />
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={onToggleMusic}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-[#FCD34D]/30 text-[#FCD34D] hover:bg-[#FCD34D]/10 transition-all group shadow-[0_0_20px_rgba(252,211,77,0.1)]"
            title={isMusicPlaying ? "Pause Music" : "Play Music"}
          >
              {isMusicPlaying ? (
                  <div className="relative animate-music-pulse">
                      <Volume2 size={24} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
              ) : (
                  <VolumeX size={24} className="opacity-60" />
              )}
          </button>
      </div>

      {/* 2. 左上角文字: 最最喜欢孙畅了 */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 text-left animate-fade-in-down">
        <h1 className="text-3xl md:text-5xl font-bold text-[#FCD34D] font-serif tracking-tight drop-shadow-lg leading-tight">
          赵贤成会一直<br/>
          <span>一直喜欢孙畅</span>
        </h1>
        <div className="h-1 w-20 bg-emerald-600 mt-4 rounded-full" />
        <p className="text-emerald-200/80 text-xs md:text-sm tracking-[0.2em] uppercase mt-2 font-light">
          Forever & Always
        </p>
      </div>

      {/* 3. 拍立得照片 (Polaroid Style) - Fixed Heart Icon */}
      <div 
        className="absolute top-1/3 left-8 md:left-20 transform -rotate-6 transition-all duration-500 hover:rotate-0 hover:scale-110 pointer-events-auto cursor-pointer group"
        style={{ perspective: '1000px' }}
        onClick={handlePolaroidClick}
        title="点击上传照片"
      >
        <div className="bg-white p-3 pb-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-sm max-w-[160px] md:max-w-[200px] relative">
          
          {/* Upload Hint Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 backdrop-blur-sm">
                <Camera size={14} />
                <span>上传照片</span>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
             {/* Fixed Heart Icon */}
             <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" />
             
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/5 to-transparent mix-blend-multiply pointer-events-none" />
          </div>
          <div className="mt-4 text-center font-handwriting text-gray-600 text-sm md:text-base transform rotate-1">
             Add Memories ❤️
          </div>
        </div>
      </div>

      {/* 4. 右下角按钮 & 状态文字 */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-end pointer-events-auto">
        {/* 文字提示气泡 */}
        <div className={`mb-4 max-w-[280px] md:max-w-md text-right transition-all duration-700 ${isTree ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-2'}`}>
            <p className={`text-[#FCD34D] font-serif italic text-lg md:text-2xl drop-shadow-md leading-relaxed ${isTree ? 'animate-pulse-slow' : ''}`}>
              {isTree 
                ? "Merry Christmas! 全世界最最好看，最最聪明，最最善良的孙畅，圣诞快乐！" 
                : "点我一下会有魔法出现哦 ✨"}
            </p>
        </div>

        <button
          onClick={onToggle}
          className="group relative px-6 py-3 md:px-8 md:py-4 bg-[#022c22]/90 backdrop-blur-xl border border-[#FCD34D]/50 rounded-full overflow-hidden transition-all duration-500 hover:bg-[#FCD34D] hover:scale-105 shadow-[0_0_30px_rgba(252,211,77,0.2)]"
        >
          <div className="flex items-center gap-3">
             {isTree ? (
               <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-beat" />
             ) : (
               <Sparkles className="w-5 h-5 text-[#FCD34D] group-hover:text-[#022c22] animate-spin-slow" />
             )}
            <span className="text-[#FCD34D] font-bold tracking-widest text-xs md:text-sm group-hover:text-[#022c22] transition-colors uppercase">
              {isTree ? 'Touch to Scatter' : 'Make a Wish'}
            </span>
          </div>
          
          {/* Internal Glow Effect */}
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover:animate-shine" />
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
        
        .font-handwriting {
          font-family: 'Dancing Script', cursive;
        }

        @keyframes shine {
          100% { transform: translateX(100%) skewX(-12deg); }
        }
        .group:hover .group-hover\\:animate-shine {
          animation: shine 1s;
        }
        
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-beat {
          animation: beat 1s infinite;
        }

        @keyframes pulse-slow {
           0%, 100% { opacity: 1; }
           50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes music-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-music-pulse {
            animation: music-pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};