import { SkipBackIcon as Backspace, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Key({
  keyValue,
  pressed,
  isWide = false,
  isExtraWide = false,
}: {
  keyValue: string;
  pressed: boolean;
  isWide?: boolean;
  isExtraWide?: boolean;
}) {
  const getKeyDisplay = () => {
    if (keyValue === 'Space') return 'SPACE';
    if (keyValue === 'Backspace') return <Backspace className="w-4 h-4" />;
    if (keyValue === 'Enter') return <CornerDownLeft className="w-4 h-4" />;
    return keyValue;
  };

  const getWidthClasses = () => {
    if (isExtraWide) return 'min-w-[100px] sm:min-w-[150px]';
    if (isWide) return 'min-w-[50px] sm:min-w-[70px]';
    return 'min-w-[30px] sm:min-w-[40px]';
  };

  return (
    <div
      className={cn(
        'transition-all duration-150 font-bold relative overflow-hidden rounded-md border-2 px-2 py-2 flex items-center justify-center text-sm sm:text-base shadow-[0_4px_0_0_rgba(0,0,0,0.3)]',
        getWidthClasses(),
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t bg-white',
          pressed ? 'animate-fade-out' : 'opacity-0',
        )}
      />
      <span className="relative z-10">{getKeyDisplay()}</span>
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent rounded-t-sm"></div>
    </div>
  );
}
