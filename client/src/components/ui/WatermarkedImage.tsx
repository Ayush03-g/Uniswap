import React from 'react';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export function WatermarkedImage({ containerClassName = "", className = "", alt = "Product Image", ...props }: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden w-full h-full ${containerClassName}`}>
      <img 
        alt={alt} 
        className={`w-full h-full ${className}`} 
        {...props} 
      />
      <div className="absolute bottom-2 right-2 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none select-none z-10">
        <span className="text-white/60 font-bold text-[10px] tracking-wider uppercase drop-shadow-md">UniSwap</span>
      </div>
    </div>
  );
}
