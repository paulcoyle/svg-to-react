/**
 * Totally stolen from:
 * https://github.com/stagas/kebab-to-camel/blob/main/src/index.ts
 */
export function kebabToCamel(input: string): string {
  let output = ''
  for (let i = 0, char = ''; i < input.length; i++) {
    char = input.charAt(i)
    if (char === '-') {
      output += input.charAt(++i).toUpperCase()
    } else {
      output += char
    }
  }
  return output
}

export function capitalize(input: string): string {
  if (input.length > 0) {
    return `${input.charAt(0).toLocaleUpperCase()}${input.slice(1)}`
  } else {
    return input
  }
}
