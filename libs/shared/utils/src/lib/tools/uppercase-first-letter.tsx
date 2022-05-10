export const upperCaseFirstLetter = (string: string | undefined) =>
  string && `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`
