import { WordStatus, type Word } from '@/types/game.types';
import type { OpenRouter } from './ai-service';
import assert from 'assert';

export class WordService {
  private readonly maxWords = 15;
  private readonly defaultFallSpeed = 10;
  private words: Word[] = [];
  private wordsStack: Word[] = [];

  constructor(private readonly aiService: OpenRouter) {}

  // TODO(fcasibu): Effects
  public async update(
    typed: string,
    width: number,
    height: number,
    dt: number,
  ) {
    this.words = this.words.filter((word) => {
      if (word.position.x === 0) {
        word.position.x = Math.random() * width;
      }

      // Remove missed/completed words on the next update
      if (
        word.status === WordStatus.Missed ||
        word.status === WordStatus.Completed
      ) {
        return false;
      }

      word.position.y += this.defaultFallSpeed * dt;
      word.status = this.handleWordStatus(word, typed, height);
      word.typed = typed;

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

    if (!this.words.length) {
      this.words = wordsStack.splice(-this.maxWords);
    }

    return this.words;
  }

  private handleWordStatus(
    word: Word,
    typed: string,
    height: number,
  ): WordStatus {
    let status: WordStatus | undefined;

    if (typed.startsWith(word.text)) {
      status = WordStatus.Typing;
    }

    if (!word.text.includes(typed)) {
      status = WordStatus.Error;
    }

    if (typed === word.text) {
      status = WordStatus.Completed;
    }

    if (word.position.y >= height) {
      status = WordStatus.Missed;
    }

    return status ?? WordStatus.Active;
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
