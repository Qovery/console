import { extendTailwindMerge } from 'tailwind-merge'

export const twMerge = extendTailwindMerge({
  classGroups: {
    'font-size': ['text-ssm', 'text-2xs', 'text-3xs'],
  },
})
