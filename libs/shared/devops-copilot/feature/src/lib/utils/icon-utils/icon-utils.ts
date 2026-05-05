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
    'text-positive': status === 'completed',
    'animate-spin text-warning': status === 'in_progress',
    'text-info': status === 'waiting',
    'text-negative': status === 'error',
    'text-neutral-subtle': !['completed', 'in_progress', 'waiting', 'error'].includes(status),
  })
