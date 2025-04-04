const OPEN_ROUTER_KEY = process.env.OPEN_ROUTER_API_KEY;

export class OpenRouter {
  private readonly prompt = {
    user: (n: number, baselineWords: string[]) => `
Generate a list of exactly N unique English words.

N = ${n}
BASELINE_WORDS = ${JSON.stringify(baselineWords)}

Constraints and Instructions:
1.  **Count:** The list must contain precisely N words.
2.  **Uniqueness:** All words in the generated list must be unique. No repetitions.
3.  **Difficulty:** The difficulty of the generated words (considering length, usage frequency, complexity) should generally be *higher* than the average difficulty of the words provided in the baseline list below. If the baseline list is empty, generate very simple, common words.
    *   Baseline Word List: BASELINE_WORDS
4.  **Content:** Words should primarily be common English nouns, verbs, adjectives, or adverbs. Avoid overly obscure jargon unless the baseline words strongly suggest a specific domain. Proper nouns (like 'Google', 'Apple' from your example) are acceptable if they fit the difficulty increase or are implied by the baseline, but common words are preferred.
5.  **Output Format:** Respond ONLY with a valid JSON array containing the generated words as strings. Do not include any introductory text, explanations, markdown formatting, or anything else outside the JSON array.

Example 1:
N = 3
BASELINE_WORDS = ["cat", "run", "big"]
Expected Output Format: ["journey", "discover", "imagine"]

Example 2:
N = 4
BASELINE_WORDS = ["network", "server", "system"]
Expected Output Format: ["protocol", "bandwidth", "latency", "architecture"]

Example 3 (Handles mixed case/proper nouns in baseline):
N = 3
BASELINE_WORDS = ["game", "sErvIcE", "GOOGLE"]
Expected Output Format: ["platform", "monetization", "SUBSCRIPTION"]

Example 4 (Empty Baseline):
N = 5
BASELINE_WORDS = []
Expected Output Format: ["tree", "walk", "blue", "food", "book"]

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

  public generate(count: number, baselineWords: string[]) {
    return this.getOutput(count, baselineWords);
  }

  private async getOutput(
    count: number,
    baselineWords: string[],
  ): Promise<string[]> {
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

    return data;
  }
}
