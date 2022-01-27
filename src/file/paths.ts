import { basename, resolve } from 'path'


export function toAbsolutePath(path: string): string {
  return resolve(process.cwd(), path)
}

export function getFileName(path: string): string {
  return basename(path, '.svg')
}
