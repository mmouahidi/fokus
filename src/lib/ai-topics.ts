import type { CardItem } from '@/components/CardStack'

export interface Topic {
    id: string
    name: string
    emoji: string
    count: number
    keywords: string[]
}

/**
 * Predefined topic templates for quick categorization
 */
const TOPIC_TEMPLATES: Omit<Topic, 'count'>[] = [
    {
        id: 'work',
        name: 'Work',
        emoji: '💼',
        keywords: ['work', 'project', 'meeting', 'deadline', 'client', 'business', 'professional']
    },
    {
        id: 'learning',
        name: 'Learning',
        emoji: '📚',
        keywords: ['learn', 'study', 'course', 'tutorial', 'education', 'training', 'practice', 'skill']
    },
    {
        id: 'personal',
        name: 'Personal',
        emoji: '🏠',
        keywords: ['personal', 'home', 'family', 'life', 'routine', 'chore', 'errand']
    },
    {
        id: 'creative',
        name: 'Creative',
        emoji: '🎨',
        keywords: ['create', 'design', 'write', 'build', 'make', 'content', 'art', 'craft']
    },
    {
        id: 'health',
        name: 'Health',
        emoji: '💪',
        keywords: ['health', 'fitness', 'exercise', 'workout', 'wellness', 'medical', 'diet']
    },
    {
        id: 'finance',
        name: 'Finance',
        emoji: '💰',
        keywords: ['money', 'finance', 'budget', 'payment', 'bill', 'invest', 'save', 'purchase']
    },
    {
        id: 'social',
        name: 'Social',
        emoji: '👥',
        keywords: ['social', 'friend', 'event', 'party', 'gathering', 'network', 'community']
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        emoji: '🎬',
        keywords: ['watch', 'movie', 'show', 'game', 'play', 'fun', 'entertainment', 'hobby']
    }
]

/**
 * Detects topics from a collection of items using keyword matching
 */
export function detectTopics(items: CardItem[]): Topic[] {
    if (items.length === 0) return []

    const topicCounts = new Map<string, number>()

    // Initialize counts
    TOPIC_TEMPLATES.forEach(template => {
        topicCounts.set(template.id, 0)
    })

    // Count items per topic
    items.forEach(item => {
        const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()

        TOPIC_TEMPLATES.forEach(template => {
            if (template.keywords.some(keyword => text.includes(keyword))) {
                topicCounts.set(template.id, (topicCounts.get(template.id) || 0) + 1)
            }
        })
    })

    // Build topics with counts, filter out empty ones
    const topics: Topic[] = TOPIC_TEMPLATES
        .map(template => ({
            ...template,
            count: topicCounts.get(template.id) || 0
        }))
        .filter(topic => topic.count > 0)
        .sort((a, b) => b.count - a.count) // Sort by count descending

    return topics
}

/**
 * Filters items by topic using keyword matching
 */
export function filterByTopic(items: CardItem[], topicId: string): CardItem[] {
    const topic = TOPIC_TEMPLATES.find(t => t.id === topicId)
    if (!topic) return items

    return items.filter(item => {
        const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()
        return topic.keywords.some(keyword => text.includes(keyword))
    })
}

/**
 * Gets the topic ID for a single item (returns first matching topic)
 */
export function getItemTopic(item: CardItem): string | null {
    const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase()

    for (const template of TOPIC_TEMPLATES) {
        if (template.keywords.some(keyword => text.includes(keyword))) {
            return template.id
        }
    }

    return null
}

/**
 * Suggests tags for an item based on existing user patterns and AI analysis
 */
export function suggestTagsForItem(item: CardItem, allItems: CardItem[]): string[] {
    const suggestions = new Set<string>()

    // 1. Get most common tags from all items
    const tagFrequency = new Map<string, number>()
    allItems.forEach(i => {
        i.tags.forEach(tag => {
            tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
        })
    })

    // 2. Find tags from similar items (same type)
    const similarItems = allItems.filter(i => i.type === item.type && i.id !== item.id)
    const similarTags = new Map<string, number>()
    similarItems.forEach(i => {
        i.tags.forEach(tag => {
            similarTags.set(tag, (similarTags.get(tag) || 0) + 1)
        })
    })

    // 3. Keyword-based suggestions
    const text = `${item.title} ${item.summary}`.toLowerCase()
    const keywordSuggestions: { [key: string]: string[] } = {
        learning: ['learn', 'study', 'course', 'tutorial', 'education'],
        work: ['work', 'project', 'meeting', 'deadline', 'client'],
        urgent: ['urgent', 'asap', 'important', 'priority'],
        quick: ['quick', 'fast', 'short', 'brief'],
        research: ['research', 'explore', 'investigate', 'analyze'],
        development: ['code', 'develop', 'build', 'programming', 'software'],
        reading: ['read', 'article', 'book', 'blog'],
        watching: ['watch', 'video', 'movie', 'show']
    }

    Object.entries(keywordSuggestions).forEach(([tag, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
            suggestions.add(tag)
        }
    })

    // 4. Add popular tags from similar items
    const sortedSimilarTags = Array.from(similarTags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([tag]) => tag)

    sortedSimilarTags.forEach(tag => suggestions.add(tag))

    // 5. Filter out tags already on the item
    const existingTags = new Set(item.tags)
    const filteredSuggestions = Array.from(suggestions)
        .filter(tag => !existingTags.has(tag))
        .slice(0, 4) // Max 4 suggestions

    return filteredSuggestions
}
