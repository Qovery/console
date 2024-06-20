import { type Value } from '@qovery/shared/interfaces'

export const strictFilterVersion = ({ value }: Value, inputValue: string) => {
  const searchPattern = new RegExp(`^${inputValue.replace('.', '\\.')}`)
  return searchPattern.test(value)
}
