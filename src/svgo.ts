export type PseudoAstAttr = {
  name: string
  value: string
  prefix: string
  local: string
}

export type PseudoAstElement = {
  attrs?: {
    [key: string]: {
      value?: string
    }
  }
  addAttr(attr: PseudoAstAttr): void
  isElem(elemName: string): boolean
  removeAttr(name: string): void
}

export function addAttribute(
  elem: PseudoAstElement,
  name?: string,
  value?: string,
) {
  if (name && value) {
    elem.addAttr({
      name: name,
      value: value,
      prefix: '',
      local: name,
    })
  }
}

export function renameAttribute(
  elem: PseudoAstElement,
  from: string,
  to: string,
) {
  if (elem.attrs && elem.attrs[from] && elem.attrs[from].value !== undefined) {
    const value = elem.attrs[from].value
    elem.removeAttr(from)
    addAttribute(elem, to, value)
  }
}

export function replaceAttribute(
  elem: PseudoAstElement,
  name: string,
  replacer: (value?: string) => string,
) {
  if (elem.attrs && elem.attrs[name]) {
    elem.attrs[name].value = replacer(elem.attrs[name].value)
  }
}
