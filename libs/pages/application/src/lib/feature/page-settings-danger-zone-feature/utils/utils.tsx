import { UseFormRegister, UseFormUnregister } from 'react-hook-form/dist/types/form'

export const onAddStorage = (
  register: UseFormRegister<{ [key: string]: string | number }>,
  keys: string[]
): string[] => {
  const id = Math.trunc(Math.random() * 10000).toString()

  register('size_' + id, { value: '' })
  register('type_' + id, { value: '' })
  register('path_' + id, { value: '' })

  return [...keys, id]
}

export const onRemove = (
  key: string,
  unregister: UseFormUnregister<{ [key: string]: string | number }>,
  keys: string[]
): string[] => {
  unregister('size_' + key)
  unregister('type_' + key)
  unregister('path_' + key)

  return keys.filter((k) => k !== key)
}
