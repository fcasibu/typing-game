import { SkipBackIcon as Backspace, CornerDownLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

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
    return 'min-w-[30px] sm:min-w-[40px] aspect-square';
  };

  return (
    <div
      className={cn(
        'duration-150 font-bold relative overflow-hidden rounded-md bg-white/5 h-6 w-6 flex items-center justify-center text-sm sm:text-base',
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
    </div>
  );
}
