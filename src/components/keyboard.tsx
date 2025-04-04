'use client';

import { memo } from 'react';
import { Key } from '@/components/key';
import { cn } from '@/lib/utils';

const rows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
  ['Space', 'Enter'],
];

const layoutClasses = {
  compact: 'p-4 gap-1',
  split: 'p-6 gap-2',
  standard: 'p-6 gap-1.5',
};

const KeyboardRow = memo(
  ({
    keys,
    rowIndex,
    layout,
    activeKey,
  }: {
    keys: (typeof rows)[number];
    rowIndex: number;
    layout?: 'standard' | 'compact' | 'split';
    activeKey?: string | null;
  }) => {
    const enteredKey = activeKey?.toLowerCase() ?? '';

    return (
      <div
        className={cn(
          'flex justify-center gap-1 mb-2 last:mb-0',
          layout === 'split' && rowIndex !== 4 && 'gap-6',
          rowIndex === 4 ? 'mt-2' : '',
        )}
      >
        {keys.map((key) => (
          <Key
            key={key}
            keyValue={key}
            pressed={enteredKey === key.toLowerCase()}
            isWide={key === 'Space' || key === 'Backspace'}
            isExtraWide={key === 'Space'}
          />
        ))}
      </div>
    );
  },
);

KeyboardRow.displayName = 'KeyboardRow';

const Keyboard = memo(
  ({
    activeKey,
    layout = 'standard',
    className,
  }: {
    activeKey?: string | null;
    layout?: 'standard' | 'compact' | 'split';
    className?: string;
  }) => {
    return (
      <div className={cn(className, layoutClasses[layout])}>
        <div className="absolute inset-0 rounded-lg pointer-events-none"></div>
        <div className="relative z-10">
          {rows.map((row, rowIndex) => (
            <KeyboardRow
              key={`row-${rowIndex}`}
              keys={row}
              rowIndex={rowIndex}
              layout={layout}
              activeKey={activeKey}
            />
          ))}
        </div>
      </div>
    );
  },
);

Keyboard.displayName = 'Keyboard';

export { Keyboard };
