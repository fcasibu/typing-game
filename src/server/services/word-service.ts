import { WordStatus, type Word } from '@/types/game.types';
import type { OpenRouter } from './ai-service';
import assert from 'assert';

export class WordService {
  private readonly maxWords = 15;
  private readonly defaultFallSpeed = 30;
  private words: Word[] = [];
  private wordsStack: Word[] = [];
  private lastY = 0;
  private lastX = 0;

  constructor(private readonly aiService: OpenRouter) {}

  // TODO(fcasibu): Effects
  public async update(
    inputPayload: { backspace: boolean; submit: boolean; typed: string },
    width: number,
    height: number,
    dt: number,
  ) {
    const candidateId = this.findMatchingWordCandidateForError(
      inputPayload.typed,
    );

    this.words = this.words.filter((word) => {
      const maxX = Math.max(0, width / 1.3);

      // TODO(fcasibu): better heuristics for initial position to not overlap
      if (word.position.x === 0 && word.position.y === 0) {
        const MIN_SPACING_X = 150;
        const MIN_SPACING_Y = 80;

        let x = Math.random() * maxX;
        let y = -(Math.random() * 150);

        if (Math.abs(x - this.lastX) < MIN_SPACING_X) {
          x = (this.lastX + MIN_SPACING_X) % maxX;
        }
        if (Math.abs(y - this.lastY) < MIN_SPACING_Y) {
          y = this.lastY - MIN_SPACING_Y;
        }

        word.position.x = x;
        word.position.y = y;
        this.lastX = x;
        this.lastY = y;
      }

      word.position.y += this.defaultFallSpeed * dt;

      // filter missed/completed on the next render cycle
      if (
        word.status === WordStatus.Completed ||
        word.status === WordStatus.Missed
      ) {
        return false;
      }

      word.status = this.handleWordStatus(
        word,
        inputPayload,
        candidateId,
        height,
      );

      word.typed = this.handleWordTyped(inputPayload);

      return true;
    });

    return await this.getCurrentWords();
  }

  public async getCurrentWords() {
    const wordsStack = await this.generateWordsStack();

    assert(wordsStack.length, 'Words stack should not be empty');
    assert(
      wordsStack.length >= this.maxWords,
      'Words stack should include enough words',
    );

    while (this.words.length < this.maxWords && wordsStack.length > 0) {
      this.words.push(wordsStack.pop()!);
    }

    return this.words;
  }

  private handleWordTyped(inputPayload: {
    backspace: boolean;
    submit: boolean;
    typed: string;
  }) {
    // removing a character is done in player-service
    if (inputPayload.backspace) {
      return inputPayload.typed;
    }

    if (inputPayload.submit) {
      return '';
    }

    return inputPayload.typed;
  }

  private handleWordStatus(
    word: Word,
    inputPayload: { submit: boolean; typed: string },
    candidateId: string | null,
    height: number,
  ): WordStatus {
    if (word.position.y >= height) {
      return WordStatus.Missed;
    }

    if (candidateId === word.id) {
      if (inputPayload.typed) {
        if (inputPayload.typed === word.text && inputPayload.submit) {
          return WordStatus.Completed;
        }

        if (word.text.startsWith(inputPayload.typed)) {
          return WordStatus.Typing;
        }

        return candidateId === word.id ? WordStatus.Error : WordStatus.Active;
      }
    }

    return WordStatus.Active;
  }

  public findMatchingWordCandidateForError(typed: string): string | null {
    if (!typed || typed.length === 0) return null;

    const firstChar = typed[0]!;
    const index = this.buildFirstCharIndex();

    const relevantWords = index.get(firstChar) ?? [];
    let bestCandidate: { score: number; id: string } | null = null;
    const threshold = typed.length * 1.5;

    for (const word of relevantWords) {
      const score = this.calculateScore(typed, word.text);
      if (bestCandidate === null || score > bestCandidate.score) {
        bestCandidate = { score, id: word.id };
      }
    }

    if (bestCandidate === null || bestCandidate.score < threshold) {
      bestCandidate = null;
      for (const word of this.words) {
        const score = this.calculateScore(typed, word.text);
        if (bestCandidate === null || score > bestCandidate.score) {
          bestCandidate = { score, id: word.id };
        }
      }
    }

    return bestCandidate ? bestCandidate.id : null;
  }

  private buildFirstCharIndex(): Map<string, { id: string; text: string }[]> {
    const index = new Map<string, { id: string; text: string }[]>();
    for (const word of this.words) {
      const char = word.text[0]!;
      if (!index.has(char)) {
        index.set(char, []);
      }
      index.get(char)!.push(word);
    }
    return index;
  }

  private calculateScore(typed: string, target: string): number {
    let matchCharCount = 0;
    let nonMatchCharCount = 0;

    for (let i = 0; i < typed.length && i < target.length; i++) {
      if (typed[i] === target[i]) {
        matchCharCount += 2;
      } else {
        nonMatchCharCount += 1;
      }
    }

    const lengthPenalty = Math.abs(typed.length - target.length);
    return matchCharCount - nonMatchCharCount - lengthPenalty;
  }

  private async generateWordsStack(): Promise<Word[]> {
    if (!this.wordsStack.length) {
      const output = await this.aiService.generate(
        this.maxWords * 15,
        this.wordsStack.map((word) => word.text),
      );

      this.wordsStack = output.map(create);
    }

    return this.wordsStack;
  }
}

function create(data: { word: string; difficulty: number }): Word {
  return {
    id: crypto.randomUUID(),
    text: data.word,
    position: {
      x: 0,
      y: 0,
    },
    difficulty: data.difficulty,
    status: WordStatus.Active,
    typed: '',
  };
}
