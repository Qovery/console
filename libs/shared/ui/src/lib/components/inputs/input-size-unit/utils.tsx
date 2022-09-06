export const inputSizeUnitRules = (maxSize?: number, minSize = 0) => ({
  required: 'Please enter a size.',
  validate: (value: number) => (maxSize ? value <= maxSize : undefined),
  max: maxSize,
  min: minSize,
  pattern: {
    value: /^[0-9]+$/,
    message: 'Please enter a number.',
  },
})
