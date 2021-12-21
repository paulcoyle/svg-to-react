export type Config = {
  set: {
    attrs: Record<string, string>
    when: {
      attr: string
      matches: string
      andRemove?: boolean
    }
  }[]
  replace: [string, string][]
  removeAttrs: string[]
}

export const defaultConfig: Config = {
  set: [],
  replace: [],
  removeAttrs: [],
}
