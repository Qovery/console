export const isToday = (date: Date) => {
    const today = new Date()
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    )
}

export const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    )
}

export const isWithinLastSevenDays = (date: Date) => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date > sevenDaysAgo && !isToday(date) && !isYesterday(date)
}

export const isWithinLastThirtyDays = (date: Date) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date > thirtyDaysAgo && date <= sevenDaysAgo
}