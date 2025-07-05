import clsx from 'clsx'

export const getIconName = (status: string) => {
  switch (status) {
    case 'completed':
      return 'check-circle'
    case 'in_progress':
      return 'spinner'
    case 'waiting':
      return 'pause-circle'
    case 'error':
      return 'exclamation-circle'
    default:
      return 'circle'
  }
}

export const getIconClass = (status: string) =>
  clsx({
    'text-green-500': status === 'completed',
    'animate-spin text-yellow-500': status === 'in_progress',
    'text-blue-500': status === 'waiting',
    'text-red-500': status === 'error',
    'text-gray-400': !['completed', 'in_progress', 'waiting', 'error'].includes(status),
  })
