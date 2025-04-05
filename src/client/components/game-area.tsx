'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { WordStatus, type Word } from '../../types/game.types';

const styles = {
  active: '#FFFFFF',
  correct: '#4ADE80',
  error: '#EF4444',
} as const;

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
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bufferCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const wordPositionsRef = useRef<
    Map<string, { x: number; y: number; status: WordStatus }>
  >(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const devicePixelRatioRef = useRef<number>(window.devicePixelRatio || 1);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const animationFrame = animationFrameRef.current;

    if (!bufferCanvasRef.current) {
      bufferCanvasRef.current = document.createElement('canvas');
    }
    const bufferCanvas = bufferCanvasRef.current;

    const dpr = devicePixelRatioRef.current;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    bufferCanvas.width = width * dpr;
    bufferCanvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    const bufferCtx = bufferCanvas.getContext('2d');

    if (!ctx || !bufferCtx) return;

    ctx.scale(dpr, dpr);
    bufferCtx.scale(dpr, dpr);

    ctx.imageSmoothingEnabled = false;
    bufferCtx.imageSmoothingEnabled = false;

    ctxRef.current = ctx;
    bufferCtxRef.current = bufferCtx;

    bufferCtx.fillStyle = '#000000';
    bufferCtx.fillRect(0, 0, width, height);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [width, height]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const bufferCtx = bufferCtxRef.current;
    if (!ctx || !bufferCtx || !words.length) return;

    const newWordPositions = new Map();
    const dirtyRegions = new Set<string>();

    words.forEach((word) => {
      const posKey = `${word.id}`;
      const oldPos = wordPositionsRef.current.get(posKey);

      if (
        !oldPos ||
        oldPos.x !== word.position.x ||
        oldPos.y !== word.position.y ||
        oldPos.status !== word.status
      ) {
        if (oldPos) {
          const fontSize = getFontSize(word.difficulty);
          const textWidth = bufferCtx.measureText(word.text).width;
          dirtyRegions.add(
            `${Math.floor(oldPos.x - 2)},${Math.floor(oldPos.y - fontSize)},${Math.ceil(textWidth + 4)},${Math.ceil(fontSize * 2)}`,
          );
        }

        const fontSize = getFontSize(word.difficulty);
        bufferCtx.font = `${fontSize}px monospace`;
        const textWidth = bufferCtx.measureText(word.text).width;
        dirtyRegions.add(
          `${Math.floor(word.position.x - 2)},${Math.floor(word.position.y - fontSize)},${Math.ceil(textWidth + 4)},${Math.ceil(fontSize * 2)}`,
        );
      }

      newWordPositions.set(posKey, {
        x: word.position.x,
        y: word.position.y,
        status: word.status,
      });
    });

    wordPositionsRef.current.forEach((pos, id) => {
      if (!newWordPositions.has(id)) {
        const fontSize = 24;
        dirtyRegions.add(
          `${Math.floor(pos.x - 2)},${Math.floor(pos.y - fontSize)},100,${Math.ceil(fontSize * 2)}`,
        );
      }
    });

    bufferCtx.textBaseline = 'middle';

    dirtyRegions.forEach((region) => {
      const [x, y, w, h] = region.split(',').map(Number);
      bufferCtx.fillStyle = '#000000';
      bufferCtx.fillRect(x, y, w, h);
    });

    let currentFontSize = 0;
    const fontFamily = 'monospace';

    for (const word of words) {
      const fontSize = getFontSize(word.difficulty);

      if (fontSize !== currentFontSize) {
        bufferCtx.font = `${fontSize}px ${fontFamily}`;
        currentFontSize = fontSize;
      }

      const x = Math.max(0, Math.min(word.position.x, width));
      const y = Math.min(word.position.y, height);

      const drawFunction = drawFunctions[word.status];
      if (drawFunction) {
        drawFunction(bufferCtx, word, x, y, fontSize);
      }
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(bufferCanvasRef.current!, 0, 0, width, height);

    wordPositionsRef.current = newWordPositions;
  }, [words, width, height, getFontSize, drawFunctions]);

  return (
    <div className="relative game-area">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 rounded-lg bg-black w-full"
      />
    </div>
  );
}
