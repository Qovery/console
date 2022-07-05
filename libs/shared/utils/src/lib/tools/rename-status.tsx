import { StateEnum } from 'qovery-typescript-axios'

export function renameStatus(value?: string): string | undefined {
  if (value === StateEnum.RUNNING) {
    return 'DEPLOYMENT OK'
  } else {
    return value
  }
}
