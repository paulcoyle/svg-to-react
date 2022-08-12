export function assertString(x: unknown): asserts x is string {
  if (typeof x !== 'string') {
    throw new TypeError('Expected string')
  }
}

export function capitalize(s: string): string {
  assertString(s)
  return s.charAt(0).toLocaleUpperCase() + s.substring(1)
}

function toCamel(delimiter: string, s: string) {
  assertString(delimiter)
  assertString(s)
  const [head, ...tail] = s.split(delimiter)
  return `${head}${tail.map(capitalize).join('')}`
}

export function kebabToCamel(s: string) {
  assertString(s)
  return toCamel('-', s)
}

export function stapleToCamel(s: string) {
  assertString(s)
  return toCamel(':', s)
}
