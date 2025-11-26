/**
 * Utility functions for Google Calendar integration
 */

/**
 * Formats a Date object to Google Calendar's required format (YYYYMMDDTHHmmssZ)
 */
function formatGoogleCalendarDate(date: Date): string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Generates a Google Calendar URL with pre-filled event details
 * @param title Event title
 * @param description Event description
 * @param startDate When the event starts
 * @param durationMinutes How long the event lasts (default: 60 minutes)
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarURL(
    title: string,
    description: string,
    startDate: Date,
    durationMinutes: number = 60
): string {
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000)

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        details: description,
        dates: `${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}`
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Opens Google Calendar with a pre-filled event in a new window
 */
export function openInGoogleCalendar(
    title: string,
    description: string,
    startDate: Date,
    durationMinutes: number = 60
): void {
    const url = generateGoogleCalendarURL(title, description, startDate, durationMinutes)
    window.open(url, '_blank', 'noopener,noreferrer')
}
