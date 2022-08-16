# svg-to-react

[![npm version](https://badge.fury.io/js/@paulcoyle%2Fsvg-to-react.svg)](https://badge.fury.io/js/@paulcoyle%2Fsvg-to-react)

`@paulcoyle/svg-to-react` is an "opinionated" (read: not exceedingly configurable and primarily built to serve my own needs) utility that will convert SVGs to React components.
There are other utilities that do this and likely do it much better but lacked providing a means to hook-in to the React side of the generated components.

## Usage

Run by providing an input directory and an output directory:

```bash
npx @paulcoyle/svg-to-react <input-directory> <output-directory>
```

This will convert any `*.svg` files in the input directory to React components in the output directory using the default configuration.
Currently this only searches the direct contents of the input directory and does not descend recursively.

To provide a configuration file, pass the path to the file with either `-c` or `--config`:

```bash
npx @paulcoyle/svg-to-react -c <config-path> <input-directory> <output-directory>
```

## Formatting

This utility will format the resulting components and index files using Prettier.
The nearest Prettier configuration file to the output directory will be used.
If no configuration file is found, the Prettier defaults are used.

## Configuration

Configuration files are defined in JSON and take the following form:

```typescript
export type Config = {
  preProcess: {
    /**
     * Used to set attribute values given some condition.
     */
    set: {
      attrs: Record<string, string>
      when?: {
        attr: string
        matches: string
        remove?: boolean
      }
    }[]
    /**
     * Used to replace strings in the raw SVG.
     */
    replace: [string, string][]
    /**
     * Used to simply remove attributes from all elements.
     */
    remove: string[]
  }
  convert: {
    /**
     * The template to use when assembling the React component.
     */
    componentTemplate: string[]
  }
  finalize: {
    /**
     * The template to use to assemble a module index file.
     */
    indexTemplate: string[]
  }
}
```

## Preprocessing Steps

Several preprocessing steps are done on SVGs before they are converted to React components.
The following steps are configurable and are performed in a particular order:

1. "Remove" transforms: removes attributes listed in the config under `preProcess.remove`.
1. "Set" transforms: sets particular attribute-value pairs on elements when certain conditions are met.
1. "Replacement" transforms: replaces values in the SVG, treated as a string.

### React-Escapes

A special step is performed after all of these which is called a React-escape.
Essentially, it is a way to emit code into attributes on elements in the SVG rather than just strings.
To use a React-escape, simply format the attribute value like so: `react::(VALUE_HERE)`.

This would manifest like so:

```svg
<svg>
  <path d="react::(drawPath())" />
</svg>
```

```typescriptreact
const YourComponent = () => {
  return (
    <svg>
      <path d={drawPath()} />
    </svg>
  )
}
```

This is often useful in combination with the "Set" preprocessing step documented below.

### Preprocess Step: Removal

Any attributes listed in the `preProcess.remove` configuration array will be removed _from all elements_.

For example, with the following configuration

```json
{
  "preProcess": {
    "remove": ["fill", "stroke"]
  }
}
```

The transformation is

```svg
<!-- Input -->
<svg>
  <path fill="#ff00ff" stroke="#000000" d="..." />
  <path stroke="#000000" d="..." />
  <path fill="#ff00ff" d="..." />
</svg>

<!-- Output -->
<svg>
  <path d="..." />
  <path d="..." />
  <path d="..." />
</svg>
```

### Preprocess Step: Set

This step allows for setting particular attribute-value pairs on an element when certain conditions are met.
Conditions for each "set" application are contained in the `when` portion of their configuration.
Note that specifying a `when` condition is completely optional and, when omitted, causes the attribute-value pair to be set on every element.

A single "set" configuration is broken down like so:

```typescript
type SetStep = {
  /**
   * The attribute-value pairs to set.
   * Note that these may include variables from capture groups in `when.matches`
   */
  attrs: Record<string, string>
  when?: {
    /**
     * The attribute to inspect on the element.
     */
    attr: string
    /**
     * A regular expression which, when providing a match, causes the
     * attribute-value pairs to be set.
     * Note that this can contain capture groups to be used in conjunction with
     * `attrs`.
     */
    matches: string
    /**
     * When `true`, will cause the `attr` to be removed when there is a
     * positive match.
     */
    remove?: boolean
  }
}
```

This can be very useful, especially when paired with React-escapes.

For example, with the following configuration

```json
{
  "preProcess": {
    "set": [
      {
        "attrs": {
          "data-id": "react::(registerId('$1'))"
        },
        "when": {
          "attr": "class",
          "matches": "elem-id-([0-9+])"
        }
      }
    ]
  }
}
```

The transformation is

```svg
<!-- Input -->
<svg>
  <path class="primary elem-id-90210" d="..." />
</svg>

<!-- Output (SVG) -->
<svg>
  <path
    class="primary elem-id-90210"
    data-id="react::(registerId('90210'))"
    d="..."
  />
</svg>
```

The resulting component might look something like

```typescriptreact
const YourComponent = () => {
  return (
    <svg>
      <path
        class="primary elem-id-90210"
        data-id={registerId('90210')}
        d="..."
      />
    </svg>
  )
}
```

### Preprocess Step: Replace

While the prior steps work on an AST representation of the SVG, this step treats the whole SVG as a string and allows you do do _any_ replacements you want.
You may use regular expressions and capture groups here.

For example, with the following configuration

```json
{
  "preProcess": {
    "replace": [
      ["sensitive-value", "xxxxxxxx"],
      ["<!-- TODO: (.+?) -->", ""]
    ]
  }
}
```

The transformation is

```svg
<!-- Input -->
<svg>
  <!-- TODO: remove sensitive data in our SVGs -->
  <path d="..." data-user="password:sensitive-value" />
</svg>

<!-- Output -->
<svg>

  <path d="..." data-user="password:xxxxxxxx" />
</svg>
```

## Non-Configurable Processing Steps

Several SVGO plugins are applied every time: `convertShapeToPath`, `convertPathData`, `convertTransform`, and `removeTitle`.

## Templates

In order to complete the transformation from SVG to a React component, the transformed SVG markup is injected into a component template.
Once all SVGs are converted to components, an index file is generated by injecting all the converted (relative) file paths and their associated component names into the index template.
Templates are in EJS so you will usually interpolate values with `<%- value %>`.

### Component Template

Component templates have the following values injected into them:

- `content` - the content to be returned by the component
- `componentName` - the name of the component taken from the original SVG file name capitalized and converted from kebab-case to CamelCase if required
- `tsRelativeImportPath` - the relative import path to the index (rarely used for component templates)
- `path` - the path where the component will be written
- `name` - the base name of the original SVG file

Here is an example component template:

```ejs
import { cloneElement, forwardRef } from 'react'

export const <%- componentName %> = forwardRef<SVGSVGElement>(function <%- componentName %>(props, ref) {
  return cloneElement(<%- content %>, { ...props, ref })
})
```

In the config file, this would be entered as

```json
{
  "convert": {
    "componentTemplate": [
      `import { cloneElement, forwardRef } from 'react'`,
      ``,
      `export const <%- componentName %> = forwardRef<SVGSVGElement>(function <%- componentName %>(props, ref) {`,
      `  return cloneElement(<%- content %>, { ...props, ref })`,
      `})`,
      ``
    ]
  }
}
```

### Index Template

The index template receives `components`, an array of the component data described in the component template above.

Here is an example index template:

```ejs
<% components.forEach(function(component) { -%>
  export { <%- component.componentName %> } from '<%- component.tsRelativeImportPath %>'
<% }); -%>
```

In the config file, this would be entered as

```json
{
  "finalize": {
    "indexTemplate": [
      `<% components.forEach(function(component) { -%>`,
      `  export { <%- component.componentName %> } from '<%- component.tsRelativeImportPath %>'`,
      `<% }); -%>`
    ]
  }
}
```

## Prior Art

- [SVGO](https://github.com/svg/svgo)
- [SVGR](https://react-svgr.com/)
- [SVGMT](https://hugozap.github.io/react-svgmt/) - not exactly prior art but a very cool concept
