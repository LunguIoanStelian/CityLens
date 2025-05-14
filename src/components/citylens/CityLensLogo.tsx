import { Camera, ScanLine } from 'lucide-react';

export function CityLensLogo({ size = 6 }: { size?: number }) {
  return (
    <div className="flex items-center space-x-2 text-primary">
      <div className="relative">
        <Camera className={`w-${size + 2} h-${size + 2}`} />
        <ScanLine className={`w-${size} h-${size} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent opacity-75`} />
      </div>
      <span className={`text-${size === 6 ? '2xl' : 'xl'} font-semibold text-foreground`}>CityLens</span>
    </div>
  );
}
