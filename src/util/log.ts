import pc from 'picocolors'

export function plain(message: string) {
  console.log(message)
}

export function info(message: string, tag = 'INFO') {
  console.log(`${pc.blue(`[${tag}]`)} ${message}`)
}

export function warn(message: string, tag = 'WARN') {
  console.log(`${pc.yellow(`[${tag}]`)} ${message}`)
}

export function error(message: string, tag = 'ERR!') {
  console.log(`${pc.red(`[${tag}]`)} ${message}`)
}

export function success(message: string, tag = 'DONE') {
  console.log(`${pc.green(`[${tag}]`)} ${message}`)
}
