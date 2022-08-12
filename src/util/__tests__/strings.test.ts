import { capitalize, kebabToCamel } from '../strings'

describe('capitalize', () => {
  it('should uppercase the first character of a string', () => {
    expect(capitalize('x')).toBe('X')
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle non-alpha characters at the beginning by doing nothing', () => {
    expect('2legit').toBe('2legit')
  })

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('')
  })

  it('should throw when provided anything other than a string', () => {
    // @ts-expect-error Testing bad arguments.
    expect(() => capitalize(1)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => capitalize([])).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => capitalize(null)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => capitalize(undefined)).toThrow()
  })
})

describe('kebabToCamel', () => {
  it('should camelCase kebab-cased strings', () => {
    expect(kebabToCamel('one-two-three')).toBe('oneTwoThree')
  })

  it('should handle non-kebab strings', () => {
    expect(kebabToCamel('bonanza')).toBe('bonanza')
    expect(kebabToCamel('staple:case')).toBe('staple:case')
  })

  it('should handle empty strings', () => {
    expect(kebabToCamel('')).toBe('')
  })

  it('should throw when provided anything other than a string', () => {
    // @ts-expect-error Testing bad arguments.
    expect(() => kebabToCamel(1)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => kebabToCamel([])).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => kebabToCamel(null)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => kebabToCamel(undefined)).toThrow()
  })
})
