import {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInCalendarDays,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns'

export {
  format,
  formatDistanceToNow,
  differenceInDays,
  differenceInCalendarDays,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
  isAfter,
  parseISO,
}

/**
 * Get a friendly greeting based on time of day
 */
export function getGreeting(name) {
  const hour = new Date().getHours()
  if (hour < 6) return `Sweet dreams, ${name} 🌙`
  if (hour < 12) return `Good morning, ${name} ☁️`
  if (hour < 17) return `Good afternoon, ${name} ☀️`
  if (hour < 21) return `Good evening, ${name} 🌤️`
  return `Good night, ${name} ✨`
}

/**
 * Calculate days together from an anniversary date
 */
export function daysTogether(anniversaryDate) {
  if (!anniversaryDate) return 0
  const anniversary = typeof anniversaryDate === 'string' ? parseISO(anniversaryDate) : anniversaryDate
  return differenceInCalendarDays(new Date(), anniversary)
}

/**
 * Format a relative date nicely
 */
export function formatRelative(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  const days = differenceInCalendarDays(new Date(), d)
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days === -1) return 'Tomorrow'
  if (days < -1 && days > -7) return `In ${Math.abs(days)} days`
  if (days > 1 && days < 7) return `${days} days ago`
  
  return format(d, 'MMM d, yyyy')
}

/**
 * Get all days in a month grid (including padding from prev/next months)
 */
export function getMonthGrid(date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}
