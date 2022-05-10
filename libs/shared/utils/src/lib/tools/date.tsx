import { formatDistanceToNowStrict } from 'date-fns'

export const timeAgo = (date: Date) => formatDistanceToNowStrict(date)
