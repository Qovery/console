export const upperCaseFirstLetter = (string = '') =>
  `${string.slice(0, 1).toUpperCase()}${string.toLowerCase().slice(1)}`
