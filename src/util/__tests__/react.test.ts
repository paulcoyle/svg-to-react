import { attrToReact } from '../react'

describe('attrToReact', () => {
  it('should convert kebab-cased attributes to camelCased ones', () => {
    expect(attrToReact('clip-path')).toBe('clipPath')
    expect(attrToReact('stroke-miterlimit')).toBe('strokeMiterlimit')
  })

  it('should convert staple:cased attributes to camelCased ones', () => {
    expect(attrToReact('clip-path')).toBe('clipPath')
    expect(attrToReact('xmlns:xlink')).toBe('xmlnsXlink')
  })

  it('should throw when provided anything other than a string', () => {
    // @ts-expect-error Testing bad arguments.
    expect(() => attrToReact(1)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => attrToReact([])).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => attrToReact(null)).toThrow()
    // @ts-expect-error Testing bad arguments.
    expect(() => attrToReact(undefined)).toThrow()
  })
})
