import { memo } from 'react';
import { Key } from './key';
import { cn } from '../../lib/utils';

const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
  ['Space', 'Enter'],
];

const KeyboardRow = memo(
  ({
    keys,
    rowIndex,
    activeKey,
  }: {
    keys: (typeof rows)[number];
    rowIndex: number;
    activeKey?: string | null;
  }) => {
    const enteredKey = activeKey?.toLowerCase() ?? '';

    return (
      <div
        className={cn(
          'flex justify-center gap-1 mb-2 last:mb-0',
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
    className,
  }: {
    activeKey?: string | null;
    className?: string;
  }) => {
    return (
      <div className={cn('p-6 gap-1.5', className)}>
        <div className="absolute inset-0 rounded-lg pointer-events-none"></div>
        <div className="relative z-10">
          {rows.map((row, rowIndex) => (
            <KeyboardRow
              key={`row-${rowIndex}`}
              keys={row}
              rowIndex={rowIndex}
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
