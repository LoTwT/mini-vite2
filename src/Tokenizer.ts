export enum TokenType {
  // let
  Let = "Let",

  // =
  Assign = "Assign",

  // function
  Function = "Function",

  // 变量名
  Identifier = "Identifier",

  // (
  LeftParen = "LeftParen",

  // )
  RightParen = "RightParen",

  // {
  LeftCurly = "LeftCurly",

  // }
  RightCurly = "RightCurly",
}

export type Token = {
  type: TokenType
  value?: string
  start: number
  end: number
  raw?: string
}

// Token 生成器对象
const TOKENS_GENERATOR: Record<string, (...args: any[]) => Token> = {
  let: (start: number) => ({
    type: TokenType.Let,
    value: "let",
    start,
    end: start + 3,
  }),

  assign: (start: number) => ({
    type: TokenType.Assign,
    value: "=",
    start,
    end: start + 1,
  }),

  function: (start: number) => ({
    type: TokenType.Function,
    value: "function",
    start,
    end: start + 8,
  }),

  leftParen: (start: number) => ({
    type: TokenType.LeftParen,
    value: "(",
    start,
    end: start + 1,
  }),

  rightParen: (start: number) => ({
    type: TokenType.RightParen,
    value: ")",
    start,
    end: start + 1,
  }),

  leftCurly: (start: number) => ({
    type: TokenType.LeftCurly,
    value: "{",
    start,
    end: start + 1,
  }),

  rightCurly: (start: number) => ({
    type: TokenType.RightCurly,
    value: "}",
    start,
    end: start + 1,
  }),

  identifier: (start: number, value: string) => ({
    type: TokenType.Identifier,
    value,
    start,
    end: start + value.length,
  }),
}

type SingleCharTokens = "(" | ")" | "{" | "}" | "="

// 单字符到 Token 生成器的映射
const KNOWN_SINGLE_CHAR_TOKENS = new Map<
  SingleCharTokens,
  typeof TOKENS_GENERATOR[keyof typeof TOKENS_GENERATOR]
>([
  ["(", TOKENS_GENERATOR.leftParen],
  [")", TOKENS_GENERATOR.rightParen],
  ["{", TOKENS_GENERATOR.leftCurly],
  ["}", TOKENS_GENERATOR.rightCurly],
  ["=", TOKENS_GENERATOR.assign],
])

export class Tokenizer {
  private _tokens: Token[] = []

  private _currentIndex: number = 0

  constructor(private _source: string) {}

  tokenize = (): Token[] => {
    const isAlpha = (char: string) =>
      (char >= "a" && char <= "z") || (char >= "A" && char <= "Z")

    while (this._currentIndex < this._source.length) {
      let currentChar = this._source[this._currentIndex]
      const startIndex = this._currentIndex

      // 根据语法规则进行 token 分组
      // 在扫描字符的过程，我们需要对不同的字符各自进行不同的处理，具体的策略如下：
      // 1. 当前字符为分隔符，如空格，直接跳过，不处理；]
      // 2. 当前字符为字母，需要继续扫描，获取完整的单词:
      //    2.1 如果单词为语法关键字，则新建相应关键字的 Token
      //    2.2 否则视为普通的变量名
      // 3. 当前字符为单字符，如{、}、(、)，则新建单字符对应的 Token

      // 1. 处理空格
      if (currentChar === " ") {
        this._currentIndex += 1
        continue
      }
      // 2. 处理字母
      else if (isAlpha(currentChar)) {
        let identifier = ""
        let token: Token

        while (isAlpha(currentChar)) {
          identifier += currentChar
          this._currentIndex += 1
          currentChar = this._source[this._currentIndex]
        }

        // 如果是关键字
        if (identifier in TOKENS_GENERATOR)
          token = TOKENS_GENERATOR[identifier](startIndex)
        // 如果是普通标识符
        else token = TOKENS_GENERATOR["identifier"](startIndex, identifier)

        this._tokens.push(token)
        continue
      }
      // 3. 处理单字符
      else if (KNOWN_SINGLE_CHAR_TOKENS.has(currentChar as SingleCharTokens)) {
        const token = KNOWN_SINGLE_CHAR_TOKENS.get(
          currentChar as SingleCharTokens,
        )!(startIndex)
        this._tokens.push(token)
        this._currentIndex += 1
        continue
      }
    }

    return this._tokens
  }
}
