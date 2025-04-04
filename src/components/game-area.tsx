'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { WordStatus, type Word } from '@/types/game.types';

const styles = {
  active: '#FFFFFF',
  correct: '#4ADE80',
  error: '#EF4444',
} as const;

// ill use react compiler when i actually understand0 how it works
export function GameArea({
  words,
  width = 800,
  height = 800,
}: {
  words: Word[];
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevWordsRef = useRef<Word[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const getFontSize = useCallback((difficulty: number): number => {
    return Math.max(12, Math.min(24, 20 - difficulty));
  }, []);

  const drawActiveWord = useCallback(
    (ctx: CanvasRenderingContext2D, word: Word, x: number, y: number) => {
      ctx.fillStyle = styles.active;
      ctx.fillText(word.text, x, y);
    },
    [],
  );

  const drawTypingWord = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      word: Word,
      x: number,
      y: number,
      fontSize: number,
    ) => {
      let posX = x;

      if (word.typed.length > 0) {
        ctx.fillStyle = styles.correct;
        for (let i = 0; i < word.typed.length; i++) {
          const char = word.text[i]!;
          ctx.fillText(char, posX, y);
          posX += ctx.measureText(char).width;
        }
      }

      ctx.fillRect(posX, y - fontSize / 2, 2, fontSize);

      if (word.typed.length < word.text.length) {
        ctx.fillStyle = styles.active;
        ctx.fillText(word.text.slice(word.typed.length), posX, y);
      }
    },
    [],
  );

  const drawErrorWord = useCallback(
    (ctx: CanvasRenderingContext2D, word: Word, x: number, y: number) => {
      let posX = x;

      let correctIndex = 0;
      while (
        correctIndex < word.typed.length &&
        correctIndex < word.text.length &&
        word.typed[correctIndex] === word.text[correctIndex]
      ) {
        const char = word.text[correctIndex]!;
        ctx.fillStyle = styles.correct;
        ctx.fillText(char, posX, y);
        posX += ctx.measureText(char).width;
        correctIndex++;
      }

      for (
        let i = correctIndex;
        i < word.typed.length && i < word.text.length;
        i++
      ) {
        const originalChar = word.text[i]!;
        ctx.fillStyle = styles.error;
        ctx.fillText(originalChar, posX, y);
        posX += ctx.measureText(originalChar).width;
      }

      if (word.typed.length < word.text.length) {
        ctx.fillStyle = styles.active;
        ctx.fillText(
          word.text.slice(Math.max(correctIndex, word.typed.length)),
          posX,
          y,
        );
      }
    },
    [],
  );

  const drawCompletedWord = useCallback(
    (ctx: CanvasRenderingContext2D, word: Word, x: number, y: number) => {
      ctx.fillStyle = styles.correct;
      ctx.shadowColor = styles.correct;
      ctx.shadowBlur = 5;
      ctx.fillText(word.text, x, y);
      ctx.shadowBlur = 0;
    },
    [],
  );

  const drawMissedWord = useCallback(
    (ctx: CanvasRenderingContext2D, word: Word, x: number, y: number) => {
      ctx.fillStyle = styles.error;
      ctx.fillText(word.text, x, y);
      const width = ctx.measureText(word.text).width;
      ctx.strokeStyle = styles.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
    },
    [],
  );

  const drawFunctions = useMemo(
    () => ({
      [WordStatus.Active]: drawActiveWord,
      [WordStatus.Typing]: drawTypingWord,
      [WordStatus.Error]: drawErrorWord,
      [WordStatus.Completed]: drawCompletedWord,
      [WordStatus.Missed]: drawMissedWord,
    }),
    [
      drawActiveWord,
      drawTypingWord,
      drawErrorWord,
      drawCompletedWord,
      drawMissedWord,
    ],
  );

  const drawWords = useCallback(
    (ctx: CanvasRenderingContext2D, words: Word[]) => {
      if (wordsEqual(words, prevWordsRef.current)) {
        return;
      }

      prevWordsRef.current = words;

      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = 'middle';

      const fontFamily = 'monospace';
      let currentFontSize = 0;

      for (const word of words) {
        const fontSize = getFontSize(word.difficulty);

        if (fontSize !== currentFontSize) {
          ctx.font = `${fontSize}px ${fontFamily}`;
          currentFontSize = fontSize;
        }

        const x = Math.max(0, Math.min(word.position.x, width));
        // we're fine to go out of bounds -y
        const y = Math.min(word.position.y, height);

        const drawFunction = drawFunctions[word.status];
        if (drawFunction) {
          drawFunction(ctx, word, x, y, fontSize);
        }
      }
    },
    [width, height, getFontSize, drawFunctions],
  );

  function wordsEqual(a: Word[], b: Word[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const wordA = a[i]!;
      const wordB = b[i]!;
      if (
        wordA.id !== wordB.id ||
        wordA.status !== wordB.status ||
        wordA.text !== wordB.text ||
        wordA.typed !== wordB.typed ||
        wordA.position.x !== wordB.position.x ||
        wordA.position.y !== wordB.position.y
      ) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctxRef.current = ctx;

    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.imageSmoothingEnabled = false;
  }, [width, height]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    drawWords(ctx, words);
  }, [words, drawWords]);

  return (
    <div className="relative game-area">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg bg-black"
        style={{
          maxWidth: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
