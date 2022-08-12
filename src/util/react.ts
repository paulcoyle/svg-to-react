import { assertString, kebabToCamel, stapleToCamel } from './strings'

export function attrToReact(name: string) {
  assertString(name)

  if (name.substring(0, 2) == '--') {
    return name
  }

  return stapleToCamel(kebabToCamel(name))
}
