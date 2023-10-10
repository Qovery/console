export const upperCaseFirstLetter = (string: string) =>
  `${string.slice(0, 1).toUpperCase()}${string.toLowerCase().slice(1)}`
