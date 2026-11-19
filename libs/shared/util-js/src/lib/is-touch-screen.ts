// Primary input is a finger (phones, tablets). Used to skip behaviors that only make sense with a mouse,
// such as auto-focusing a field, which opens the virtual keyboard over half the screen.
export function isTouchScreen(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false
}
