import type { CardItem } from '@/components/CardStack'

export type KanbanColumn = 'now' | 'soon' | 'later' | 'someday'

interface CategorizationFactors {
    urgentKeywords: string[]
    soonKeywords: string[]
    laterKeywords: string[]
    somedayKeywords: string[]
}

const KEYWORDS: CategorizationFactors = {
    urgentKeywords: [
        'urgent', 'asap', 'today', 'now', 'immediately', 'deadline',
        'tomorrow', 'call', 'text', 'reply', 'respond', 'important',
        'critical', 'emergency', 'overdue'
    ],
    soonKeywords: [
        'this week', 'soon', 'upcoming', 'review', 'check',
        'finish', 'complete', 'follow up', 'important', 'priority'
    ],
    laterKeywords: [
        'later', 'eventually', 'when I have time', 'this month',
        'plan', 'start', 'begin', 'project', 'idea', 'create'
    ],
    somedayKeywords: [
        'someday', 'maybe', 'future', 'long term', 'learn',
        'explore', 'consider', 'think about', 'interesting'
    ]
}

/**
 * AI-powered categorization logic for Kanban board
 * Analyzes item content, type, tags, and metadata to suggest optimal column
 */
export function categorizeItem(item: CardItem): KanbanColumn {
    const content = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()

    // Factor 1: Keyword analysis (highest priority)
    const urgentScore = KEYWORDS.urgentKeywords.filter(kw => content.includes(kw)).length
    const soonScore = KEYWORDS.soonKeywords.filter(kw => content.includes(kw)).length
    const laterScore = KEYWORDS.laterKeywords.filter(kw => content.includes(kw)).length
    const somedayScore = KEYWORDS.somedayKeywords.filter(kw => content.includes(kw)).length

    // Factor 2: Item type weights
    const typeWeight = {
        task: { now: 3, soon: 2, later: 1, someday: 0 },
        article: { now: 1, soon: 3, later: 2, someday: 1 },
        video: { now: 0, soon: 3, later: 2, someday: 1 },
        idea: { now: 0, soon: 1, later: 3, someday: 2 }
    }

    // Factor 3: Time estimate
    const timeMinutes = parseTimeEstimate(item.timeEstimate)
    let timeWeight = { now: 0, soon: 0, later: 0, someday: 0 }

    if (timeMinutes <= 15) {
        timeWeight = { now: 2, soon: 1, later: 0, someday: 0 }
    } else if (timeMinutes <= 60) {
        timeWeight = { now: 1, soon: 2, later: 1, someday: 0 }
    } else if (timeMinutes <= 240) {
        timeWeight = { now: 0, soon: 1, later: 2, someday: 1 }
    } else {
        timeWeight = { now: 0, soon: 0, later: 1, someday: 2 }
    }

    // Factor 4: Item age (rot system)
    const ageWeight = getAgeWeight(item.timestamp)

    // Calculate total scores
    const scores = {
        now: (urgentScore * 5) + typeWeight[item.type].now + timeWeight.now + ageWeight.now,
        soon: (soonScore * 5) + typeWeight[item.type].soon + timeWeight.soon + ageWeight.soon,
        later: (laterScore * 5) + typeWeight[item.type].later + timeWeight.later + ageWeight.later,
        someday: (somedayScore * 5) + typeWeight[item.type].someday + timeWeight.someday + ageWeight.someday
    }

    // Return column with highest score
    const maxScore = Math.max(scores.now, scores.soon, scores.later, scores.someday)

    if (scores.now === maxScore) return 'now'
    if (scores.soon === maxScore) return 'soon'
    if (scores.later === maxScore) return 'later'
    return 'someday'
}

/**
 * Parse time estimate string to minutes
 */
function parseTimeEstimate(timeEstimate?: string): number {
    if (!timeEstimate) return 30 // default

    const match = timeEstimate.match(/(\d+)\s*(min|hour|hr|h|m)/i)
    if (!match) return 30

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    if (unit.startsWith('h')) {
        return value * 60
    }
    return value
}

/**
 * Calculate age-based weight (older items get higher NOW priority)
 */
function getAgeWeight(timestamp?: number): { now: number; soon: number; later: number; someday: number } {
    if (!timestamp) return { now: 0, soon: 0, later: 0, someday: 0 }

    const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60)

    if (ageHours > 72) { // > 3 days
        return { now: 3, soon: 1, later: 0, someday: 0 }
    } else if (ageHours > 48) { // > 2 days
        return { now: 2, soon: 1, later: 0, someday: 0 }
    } else if (ageHours > 24) { // > 1 day
        return { now: 1, soon: 1, later: 0, someday: 0 }
    }

    return { now: 0, soon: 0, later: 0, someday: 0 }
}

/**
 * Auto-categorize items that don't have a kanban column assigned
 */
export function autoCategorizeItems(items: CardItem[]): CardItem[] {
    return items.map(item => {
        if (!item.kanbanColumn) {
            return {
                ...item,
                kanbanColumn: categorizeItem(item)
            }
        }
        return item
    })
}

/**
 * Re-categorize all items (used for AI Sort button)
 */
export function recategorizeAllItems(items: CardItem[]): CardItem[] {
    return items.map(item => ({
        ...item,
        kanbanColumn: categorizeItem(item)
    }))
}
