import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ImageViewerProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ photoUrl, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (photoUrl) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300); // Wait for fade out
    }
  }, [photoUrl]);

  if (!photoUrl && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${photoUrl ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Image Container */}
      <div 
        className={`relative max-w-4xl max-h-[90vh] w-full transform transition-all duration-500 ${photoUrl ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-[#FCD34D] transition-colors p-2"
        >
          <X size={32} />
        </button>

        {/* Polaroid Frame */}
        <div className="bg-white p-3 md:p-4 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform rotate-1">
          <div className="relative aspect-auto min-h-[300px] flex items-center justify-center bg-gray-50 overflow-hidden border border-gray-100">
            {photoUrl && (
                <img 
                    src={photoUrl} 
                    alt="Memory" 
                    className="max-h-[75vh] w-auto object-contain shadow-inner"
                />
            )}
          </div>
          <div className="mt-4 text-center font-handwriting text-gray-600 text-xl md:text-2xl pb-2">
            Christmas Memory ✨
          </div>
        </div>
      </div>
    </div>
  );
};