export type PseudoAstAttr = {
  name: string
  value: string
  prefix: string
  local: string
}

export type PseudoAstElement = {
  type: string
  name: string
  attributes: Record<string, string>
  children: PseudoAstElement[]
}

export function addAttribute(
  elem: PseudoAstElement,
  name?: string,
  value?: string,
) {
  if (name && value) {
    elem.attributes[name] = value
  }
}

export function removeAttribute(elem: PseudoAstElement, name: string) {
  delete elem.attributes[name]
}

export function renameAttribute(
  elem: PseudoAstElement,
  from: string,
  to: string,
) {
  if (from !== to && from in elem.attributes) {
    console.log(to, from, elem.attributes[from])
    addAttribute(elem, to, elem.attributes[from])
    removeAttribute(elem, from)
  }
}

export function replaceAttribute(
  elem: PseudoAstElement,
  name: string,
  replacer: (value?: string) => string,
) {
  if (name in elem.attributes) {
    elem.attributes[name] = replacer(elem.attributes[name])
  }
}
