export function tokenizeWikiSearch(text: string): string[] {
  const runs = text.toLowerCase().match(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+|[a-z0-9_]+/gu,
  ) ?? []
  const terms: string[] = []

  for (const run of runs) {
    if (/^[a-z0-9_]+$/.test(run)) {
      terms.push(run)
      continue
    }

    const characters = Array.from(run)
    terms.push(...characters)
    for (let i = 0; i + 1 < characters.length; i++) {
      terms.push(characters[i] + characters[i + 1])
    }
  }

  return terms
}
