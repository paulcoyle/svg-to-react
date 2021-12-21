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

import { ProcessedFile } from '~/src/processed-file'
import { addAttribute, PseudoAstElement } from '~/src/svgo'


const svgoPlugin = {
  name: 'customFromIllustratorPlugin',
  type: 'perItem' as const,
  active: true,
  fn: (elem: PseudoAstElement) => {
    const attrs = preparedValuesFromElement(elem)

    elem.removeAttr('id')
    // Illustrator will assign `data-name` as the layer name when two layers
    // have the same name, modifying the IDs to be unique.
    elem.removeAttr('data-name')
    elem.removeAttr('class')

    // Only apply prepared values to non-root elements; the root svg node should
    // be clean for mutations in later processes as it is often used to set
    // prop bindings as refs, etc.
    if (!elem.isElem('svg')) {
      attrs.id && addAttribute(elem, 'id', attrs.id)
      attrs.classNames && addAttribute(elem, 'className', attrs.classNames)
      attrs.dataAttrs.forEach(({ name, value }) => {
        addAttribute(elem, `data-${name}`, value)
      })
    }

    return elem
  },
}

export const step = async (outputFile: ProcessedFile) => {
  const optimized = optimizeSvg(outputFile.content, {
    plugins: [svgoPlugin],
  })
  return { ...outputFile, content: optimized.data }
}

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
  if (elem.attrs?.id?.value?.charAt(0) === '_') {
    return { id: null, classNames: null, dataAttrs: [] }
  }

  const [id, classNames, dataAttrs] = getRawAttributesFromElement(elem)

  return {
    id: prepareIdForElement(id),
    classNames: prepareClassNamesForElement(classNames),
    dataAttrs: prepateDataAttributesForElement(dataAttrs),
  }
}

function getRawAttributesFromElement(
  elem: PseudoAstElement,
): [string?, string?, string?] {
  const sourceAttr = elem.attrs?.['data-name'] ?? elem.attrs?.id
  const maybeValues = sourceAttr?.value?.split(typeDelimiter) ?? []
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

function prepateDataAttributesForElement(dataAttrs?: string): DataAttribute[] {
  if (dataAttrs === undefined) {
    return []
  } else {
    return dataAttrs.split(intraTypeDelimiter).map((dataAttrPair) => {
      const [name, value] = dataAttrPair.split(dataAttrDelimiter)
      return { name, value }
    })
  }
}
