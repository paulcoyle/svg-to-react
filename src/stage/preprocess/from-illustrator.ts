/*
 * Prepares SVGs exported from Adobe Illustrator managing their IDs and class
 * names in a predictable way.
 *
 * Layers/paths/etc. in Illustrator named in various ways will result in SVG
 * elements with corresponding IDs and class names:
 *
 * General format:
 *
 *     [_...] | [id]:[classname[.classname[...]]]:[dataname__datavalue[.dataname__datavalue[...]]]
 *
 * Examples (layer name -> pseudo element):
 *
 *     snowflake:water.crystaline.melty
 *     <element id="snowflake" class="water crystaline melty" />
 *
 *     c64:computer:drive__1524.colour__beige
 *     <element id="c64" class="computer" data-drive="1524" data-colour="beige" />
 *
 *     ::only__data_attr
 *     <element data-only="data_attr" />
 *
 *     :thing.thing-a
 *     <element class="thing thing-a" />
 *
 *     nukacola
 *     <element id="nukacola" />
 *
 *     _anything:you.want
 *     <element />
 *
 * Given these formatting rules, and general good practices for markup, the
 * following characters cannot be used in IDs or class names:
 *
 *     : and .
 *
 * In general, it is advisable to only use [a-z0-9], -, and _ in ID and class
 * names but note that a layer whose name begins with an underscore will not
 * receive an ID nor a class.
 */

import { optimize as optimizeSvg } from 'svgo'

import { Stage } from '~/src/stage'
import {
  addAttribute,
  PseudoAstElement,
  removeAttribute,
} from '~/src/util/svgo'

const svgoPlugin = {
  name: 'customFromIllustratorPlugin',
  type: 'perItem' as const,
  active: true,
  fn: (elem: PseudoAstElement) => {
    const attrs = preparedValuesFromElement(elem)

    removeAttribute(elem, 'id')
    // Illustrator will assign `data-name` as the layer name when two layers
    // have the same name, modifying the IDs to be unique.
    removeAttribute(elem, 'data-name')
    removeAttribute(elem, 'class')

    // Only apply prepared values to non-root elements; the root svg node should
    // be clean for mutations in later processes as it is often used to set
    // prop bindings as refs, etc.
    if (elem.name !== 'svg') {
      if (attrs.id) {
        addAttribute(elem, 'id', attrs.id)
      }
      if (attrs.classNames) {
        addAttribute(elem, 'class', attrs.classNames)
      }
      attrs.dataAttrs.forEach(({ name, value }) => {
        addAttribute(elem, `data-${name}`, value)
      })
    }

    return elem
  },
}

const stage: Stage = async (_, file) => {
  const content = optimizeSvg(file.output.content, { plugins: [svgoPlugin] })
  return { ...file, output: { ...file.output, content: content.data } }
}

export default stage

/**
 * Transforms of layer names into markup attributes.
 */
const typeDelimiter = ':'
const intraTypeDelimiter = '.'
const dataAttrDelimiter = '__'

type DataAttribute = {
  name: string
  value: string
}

function preparedValuesFromElement(elem: PseudoAstElement) {
  // Skip case
  if (elem.attributes?.id?.charAt(0) === '_') {
    return { id: null, classNames: null, dataAttrs: [] }
  }

  const [id, classNames, dataAttrs] = getRawAttributesFromElement(elem)

  return {
    id: prepareIdForElement(id),
    classNames: prepareClassNamesForElement(classNames),
    dataAttrs: prepareDataAttributesForElement(dataAttrs),
  }
}

function getRawAttributesFromElement(
  elem: PseudoAstElement,
): [string?, string?, string?] {
  const sourceAttr = elem.attributes?.['data-name'] ?? elem.attributes?.id
  const maybeValues = sourceAttr?.split(typeDelimiter) ?? []
  return [maybeValues[0], maybeValues[1], maybeValues[2]]
}

function prepareIdForElement(id?: string): string | null {
  if (typeof id === 'string') {
    return id?.length ?? 0 > 0 ? id : null
  } else {
    return null
  }
}

function prepareClassNamesForElement(classNames?: string): string | null {
  return classNames?.split(intraTypeDelimiter).join(' ') ?? null
}

function prepareDataAttributesForElement(dataAttrs?: string): DataAttribute[] {
  if (dataAttrs === undefined) {
    return []
  } else {
    return dataAttrs.split(intraTypeDelimiter).map((dataAttrPair) => {
      const [name, value] = dataAttrPair.split(dataAttrDelimiter)
      return { name, value }
    })
  }
}
