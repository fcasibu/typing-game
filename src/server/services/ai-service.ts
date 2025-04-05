const OPEN_ROUTER_KEY = process.env.OPEN_ROUTER;

export class OpenRouter {
  private readonly prompt = {
    user: (n: number, baselineWords: string[]) => `
Generate a list of exactly N unique English words.

N = ${n}
BASELINE_WORDS = ${JSON.stringify(baselineWords)}

Constraints and Instructions:
1.  **Count:** The list must contain precisely N words.
2.  **Uniqueness:** All words in the generated list must be unique. No repetitions.
3.  **Difficulty:** Each generated word must have a difficulty score (1-10) based on length, usage frequency, and complexity. The words should generally be harder than the average difficulty of the words provided in the BASELINE_WORDS. If the BASELINE_WORDS is empty, generate very simple, common words with difficulty around 1-3.
    - Scale Example:
      - (1-3): Common words (e.g., "cat", "run", "big")
      - (4-6): Slightly more complex (e.g., "journey", "discover", "imagine")
      - (7-9): Advanced vocabulary (e.g., "meticulous", "phenomenon", "ubiquitous")
      - (10): Highly rare or domain-specific words (e.g., "quixotic", "antidisestablishmentarianism")
4.  **Content:** Words should primarily be common English nouns, verbs, adjectives, or adverbs. Avoid overly obscure jargon unless the baseline words strongly suggest a specific domain. Proper nouns (like 'Google', 'Apple' from your example) are acceptable if they fit the difficulty increase or are implied by the baseline, but common words are preferred.
5.  **Output Format:** Respond ONLY with a valid JSON array containing the generated words as strings. Do not include any introductory text, explanations, markdown formatting, or anything else outside the JSON array.

Example 1:
N = 3
BASELINE_WORDS = ["cat", "run", "big"]
Expected Output Format: [ { "word": "journey", "difficulty": 5 }, { "word": "discover", "difficulty": 6 }, { "word": "imagine", "difficulty": 5 } ]

Example 2:
N = 4
BASELINE_WORDS = ["network", "server", "system"]
Expected Output Format: [ { "word": "protocol", "difficulty": 6 }, { "word": "bandwidth", "difficulty": 7 }, { "word": "latency", "difficulty": 6 }, { "word": "architecture", "difficulty": 8 } ]

Example 3 (Handles mixed case/proper nouns in baseline):
N = 3
BASELINE_WORDS = ["game", "sErvIcE", "GOOGLE"]
Expected Output Format: [ { "word": "platform", "difficulty": 6 }, { "word": "monetization", "difficulty": 8 }, { "word": "SUBSCRIPTION", "difficulty": 7 } ]

Example 4 (Empty Baseline):
N = 5
BASELINE_WORDS = []
Expected Output Format: [ { "word": "tree", "difficulty": 1 }, { "word": "walk", "difficulty": 1 }, { "word": "blue", "difficulty": 2 }, { "word": "food", "difficulty": 2 }, { "word": "book", "difficulty": 2 } ]

Generate the JSON array now based on the specified N and BASELINE_WORDS
`,
    system: `
You are a highly specialized AI assistant designed for programmatic interaction. Your sole purpose is to generate structured data precisely according to user specifications. You excel at creating lists of English words based on constraints like count, uniqueness, and relative difficulty.

**Core Directives:**

1.  **Strict Adherence:** Follow ALL instructions and constraints in the user prompt meticulously. Pay extremely close attention to requested word count (\`N\`), uniqueness requirements, and difficulty adjustments relative to the provided baseline words.
2.  **Format Purity:** Your response MUST be ONLY the requested output format. For word list generation, this means providing *nothing* but a valid, raw JSON array of strings (e.g., \`["word1", "word2", "word3"]\`). Do NOT include:
    *   Introductory or concluding sentences (e.g., "Here is the list:", "I hope this helps!").
    *   Explanations of your process or word choices.
    *   Code block markers (like \`\`\`json ... \`\`\`) unless explicitly part of the requested format (which it is not in this case).
    *   Any conversational filler or extraneous text.
3.  **Accuracy Focus:** Prioritize accuracy above all else. Ensure the word count is exact, all words are unique within the list, and the difficulty interpretation (more complex/less common than baseline, or simple if baseline is empty) is reasonably applied. Interpret "difficulty" based on factors like word length, frequency of use in standard English, and abstractness. If the baseline contains specific types of words (e.g., technical terms, proper nouns), consider that context when increasing difficulty.
4.  **Consistency Engine:** Aim for consistent behavior. Given similar inputs, your output's structure, quality, and adherence to difficulty scaling should be predictable. Avoid random fluctuations in adherence to the rules.
5.  **Stability Mandate:** Operate reliably and robustly. Do not fail or produce malformed output if the user prompt is well-defined according to the expected structure. If a user prompt is fundamentally ambiguous or contradictory in a way you cannot resolve within these constraints, output a minimal error indicator if necessary (though ideally, the user prompt structure prevents this). Your default is always to attempt generation according to the rules.
6.  **No Creativity Beyond Scope:** Do not add extra words, change the requested format, or deviate from the specified task. Your role is precise data generation, not creative writing or conversation.

Your primary goal is to be a reliable, accurate, and consistent data generation engine outputting clean JSON.
`,
  };

  private static instance: OpenRouter | undefined;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new OpenRouter();
    }

    return this.instance;
  }

  public generate(
    count: number,
    baselineWords: string[],
  ): Promise<{ word: string; difficulty: number }[]> {
    return this.getOutput(count, baselineWords);
  }

  private async getOutput(
    count: number,
    baselineWords: string[],
  ): Promise<{ word: string; difficulty: number }[]> {
    // TODO(fcasibu): slow as fuck ai service probably just remove
    return [
      { word: 'tree', difficulty: 1 },
      { word: 'walk', difficulty: 1 },
      { word: 'blue', difficulty: 2 },
      { word: 'food', difficulty: 2 },
      { word: 'book', difficulty: 2 },
      { word: 'dog', difficulty: 1 },
      { word: 'run', difficulty: 1 },
      { word: 'car', difficulty: 1 },
      { word: 'bus', difficulty: 1 },
      { word: 'sky', difficulty: 1 },
      { word: 'sun', difficulty: 1 },
      { word: 'star', difficulty: 1 },
      { word: 'moon', difficulty: 1 },
      { word: 'cat', difficulty: 1 },
      { word: 'fish', difficulty: 1 },
      { word: 'river', difficulty: 1 },
      { word: 'lake', difficulty: 1 },
      { word: 'bird', difficulty: 1 },
      { word: 'rock', difficulty: 1 },
      { word: 'sand', difficulty: 1 },
      { word: 'grass', difficulty: 1 },
      { word: 'leaf', difficulty: 1 },
      { word: 'fruit', difficulty: 1 },
      { word: 'apple', difficulty: 1 },
      { word: 'banana', difficulty: 2 },
      { word: 'chair', difficulty: 1 },
      { word: 'table', difficulty: 1 },
      { word: 'door', difficulty: 1 },
      { word: 'wall', difficulty: 1 },
      { word: 'floor', difficulty: 1 },
      { word: 'bed', difficulty: 1 },
      { word: 'lamp', difficulty: 1 },
      { word: 'light', difficulty: 1 },
      { word: 'dark', difficulty: 1 },
      { word: 'happy', difficulty: 2 },
      { word: 'sad', difficulty: 1 },
      { word: 'cold', difficulty: 1 },
      { word: 'hot', difficulty: 1 },
      { word: 'wet', difficulty: 1 },
      { word: 'dry', difficulty: 1 },
      { word: 'fast', difficulty: 1 },
      { word: 'slow', difficulty: 1 },
      { word: 'big', difficulty: 1 },
      { word: 'small', difficulty: 1 },
      { word: 'long', difficulty: 1 },
      { word: 'short', difficulty: 1 },
      { word: 'high', difficulty: 1 },
      { word: 'low', difficulty: 1 },
      { word: 'new', difficulty: 1 },
      { word: 'old', difficulty: 1 },
      { word: 'young', difficulty: 1 },
      { word: 'clean', difficulty: 1 },
      { word: 'dirty', difficulty: 1 },
      { word: 'bright', difficulty: 2 },
      { word: 'quiet', difficulty: 2 },
      { word: 'loud', difficulty: 1 },
      { word: 'soft', difficulty: 1 },
      { word: 'hard', difficulty: 1 },
      { word: 'heavy', difficulty: 1 },
      { word: 'light', difficulty: 1 },
      { word: 'sharp', difficulty: 1 },
      { word: 'round', difficulty: 1 },
      { word: 'flat', difficulty: 1 },
      { word: 'deep', difficulty: 1 },
      { word: 'shallow', difficulty: 2 },
      { word: 'near', difficulty: 1 },
      { word: 'far', difficulty: 1 },
      { word: 'left', difficulty: 1 },
      { word: 'right', difficulty: 1 },
      { word: 'up', difficulty: 1 },
      { word: 'down', difficulty: 1 },
      { word: 'here', difficulty: 1 },
      { word: 'there', difficulty: 1 },
      { word: 'yes', difficulty: 1 },
      { word: 'no', difficulty: 1 },
      { word: 'good', difficulty: 1 },
      { word: 'bad', difficulty: 1 },
      { word: 'right', difficulty: 1 },
      { word: 'wrong', difficulty: 1 },
      { word: 'easy', difficulty: 1 },
      { word: 'hard', difficulty: 1 },
      { word: 'fun', difficulty: 1 },
      { word: 'boring', difficulty: 2 },
      { word: 'interesting', difficulty: 3 },
      { word: 'simple', difficulty: 2 },
      { word: 'complex', difficulty: 3 },
      { word: 'open', difficulty: 1 },
      { word: 'close', difficulty: 1 },
      { word: 'start', difficulty: 1 },
      { word: 'stop', difficulty: 1 },
      { word: 'begin', difficulty: 1 },
      { word: 'end', difficulty: 1 },
      { word: 'enter', difficulty: 1 },
      { word: 'exit', difficulty: 1 },
      { word: 'push', difficulty: 1 },
      { word: 'pull', difficulty: 1 },
      { word: 'lift', difficulty: 1 },
      { word: 'drop', difficulty: 1 },
      { word: 'catch', difficulty: 1 },
      { word: 'throw', difficulty: 1 },
      { word: 'hit', difficulty: 1 },
      { word: 'miss', difficulty: 1 },
      { word: 'win', difficulty: 1 },
      { word: 'lose', difficulty: 1 },
      { word: 'play', difficulty: 1 },
      { word: 'work', difficulty: 1 },
      { word: 'rest', difficulty: 1 },
      { word: 'sleep', difficulty: 1 },
      { word: 'wake', difficulty: 1 },
      { word: 'eat', difficulty: 1 },
      { word: 'drink', difficulty: 1 },
      { word: 'cook', difficulty: 1 },
      { word: 'bake', difficulty: 1 },
      { word: 'roast', difficulty: 2 },
      { word: 'boil', difficulty: 1 },
      { word: 'fry', difficulty: 1 },
      { word: 'grill', difficulty: 1 },
      { word: 'wash', difficulty: 1 },
      { word: 'clean', difficulty: 1 },
      { word: 'dry', difficulty: 1 },
      { word: 'brush', difficulty: 1 },
      { word: 'comb', difficulty: 1 },
      { word: 'cut', difficulty: 1 },
      { word: 'shave', difficulty: 1 },
      { word: 'paint', difficulty: 1 },
      { word: 'draw', difficulty: 1 },
      { word: 'write', difficulty: 1 },
      { word: 'read', difficulty: 1 },
      { word: 'listen', difficulty: 1 },
      { word: 'speak', difficulty: 1 },
      { word: 'sing', difficulty: 1 },
      { word: 'dance', difficulty: 1 },
      { word: 'stand', difficulty: 1 },
      { word: 'sit', difficulty: 1 },
      { word: 'lie', difficulty: 1 },
      { word: 'jump', difficulty: 1 },
      { word: 'hop', difficulty: 1 },
      { word: 'skip', difficulty: 1 },
      { word: 'run', difficulty: 1 },
      { word: 'walk', difficulty: 1 },
      { word: 'crawl', difficulty: 1 },
      { word: 'swim', difficulty: 1 },
      { word: 'climb', difficulty: 1 },
      { word: 'fall', difficulty: 1 },
      { word: 'rise', difficulty: 1 },
      { word: 'fly', difficulty: 1 },
      { word: 'drive', difficulty: 1 },
      { word: 'ride', difficulty: 1 },
      { word: 'park', difficulty: 1 },
      { word: 'stop', difficulty: 1 },
      { word: 'turn', difficulty: 1 },
      { word: 'go', difficulty: 1 },
      { word: 'come', difficulty: 1 },
      { word: 'leave', difficulty: 1 },
      { word: 'arrive', difficulty: 2 },
      { word: 'return', difficulty: 2 },
      { word: 'stay', difficulty: 1 },
      { word: 'wait', difficulty: 1 },
      { word: 'meet', difficulty: 1 },
      { word: 'part', difficulty: 1 },
      { word: 'join', difficulty: 1 },
      { word: 'build', difficulty: 1 },
      { word: 'break', difficulty: 1 },
      { word: 'fix', difficulty: 1 },
      { word: 'make', difficulty: 1 },
      { word: 'do', difficulty: 1 },
      { word: 'create', difficulty: 2 },
      { word: 'destroy', difficulty: 2 },
      { word: 'repair', difficulty: 2 },
      { word: 'change', difficulty: 1 },
      { word: 'move', difficulty: 1 },
      { word: 'carry', difficulty: 1 },
      { word: 'transport', difficulty: 3 },
      { word: 'send', difficulty: 1 },
      { word: 'receive', difficulty: 2 },
      { word: 'buy', difficulty: 1 },
      { word: 'sell', difficulty: 1 },
      { word: 'trade', difficulty: 2 },
      { word: 'give', difficulty: 1 },
      { word: 'take', difficulty: 1 },
      { word: 'keep', difficulty: 1 },
      { word: 'lose', difficulty: 1 },
      { word: 'find', difficulty: 1 },
      { word: 'seek', difficulty: 1 },
      { word: 'choose', difficulty: 1 },
      { word: 'pick', difficulty: 1 },
      { word: 'sort', difficulty: 1 },
      { word: 'arrange', difficulty: 2 },
      { word: 'organize', difficulty: 2 },
      { word: 'plan', difficulty: 1 },
      { word: 'decide', difficulty: 2 },
      { word: 'think', difficulty: 1 },
      { word: 'feel', difficulty: 1 },
      { word: 'know', difficulty: 1 },
      { word: 'learn', difficulty: 1 },
      { word: 'understand', difficulty: 2 },
      { word: 'remember', difficulty: 2 },
      { word: 'forget', difficulty: 1 },
      { word: 'notice', difficulty: 1 },
      { word: 'ignore', difficulty: 2 },
      { word: 'care', difficulty: 1 },
      { word: 'love', difficulty: 1 },
      { word: 'hate', difficulty: 1 },
      { word: 'like', difficulty: 1 },
      { word: 'want', difficulty: 1 },
      { word: 'need', difficulty: 1 },
      { word: 'give', difficulty: 1 },
      { word: 'take', difficulty: 1 },
      { word: 'ask', difficulty: 1 },
      { word: 'tell', difficulty: 1 },
      { word: 'say', difficulty: 1 },
      { word: 'call', difficulty: 1 },
      { word: 'name', difficulty: 1 },
      { word: 'shout', difficulty: 1 },
      { word: 'whisper', difficulty: 1 },
      { word: 'talk', difficulty: 1 },
      { word: 'chat', difficulty: 1 },
    ];
    // TODO(fcasibu): handle errors

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPEN_ROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat:free',
          messages: [
            {
              role: 'system',
              content: this.prompt.system,
            },
            {
              role: 'user',
              content: this.prompt.user(count, baselineWords),
            },
          ],
        }),
      },
    );

    const data = await response.json();

    return JSON.parse(data?.choices?.[0]?.message?.content) ?? [];
  }
}
