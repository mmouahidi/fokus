import type { CardItem } from '@/components/CardStack'

export interface ImportResult {
    success: boolean
    items: CardItem[]
    errors: string[]
}

/**
 * Import tasks from plain text (one task per line)
 */
export function importFromPlainText(text: string): ImportResult {
    const lines = text.split('\n').filter(line => line.trim())
    const items: CardItem[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return

        // Remove common prefixes (-, *, •, [ ], [x], numbers)
        const cleaned = trimmed
            .replace(/^[-*•]\s*/, '')
            .replace(/^\d+\.\s*/, '')
            .replace(/^\[[ x]\]\s*/i, '')

        if (cleaned.length < 3) {
            errors.push(`Line ${index + 1}: Task too short`)
            return
        }

        items.push({
            id: crypto.randomUUID(),
            type: 'task',
            title: cleaned.slice(0, 50),
            summary: cleaned,
            tags: ['Imported', 'Task'],
            timeEstimate: 'Quick task',
            timestamp: Date.now()
        })
    })

    return { success: items.length > 0, items, errors }
}

/**
 * Import from CSV format
 * Expected columns: title, description, tags, timeEstimate
 */
export function importFromCSV(csvText: string): ImportResult {
    const lines = csvText.split('\n').filter(line => line.trim())
    const items: CardItem[] = []
    const errors: string[] = []

    if (lines.length < 2) {
        return { success: false, items: [], errors: ['CSV must have header and at least one row'] }
    }

    // Skip header row
    const dataLines = lines.slice(1)

    dataLines.forEach((line, index) => {
        const columns = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''))

        if (columns.length < 1 || !columns[0]) {
            errors.push(`Row ${index + 2}: Missing title`)
            return
        }

        const [title, description, tagsStr, timeEstimate] = columns
        const tags = tagsStr ? tagsStr.split(';').map(t => t.trim()) : ['Imported']

        items.push({
            id: crypto.randomUUID(),
            type: 'task',
            title: title.slice(0, 50),
            summary: description || title,
            tags: tags.length > 0 ? tags : ['Imported', 'Task'],
            timeEstimate: timeEstimate || 'Quick task',
            timestamp: Date.now()
        })
    })

    return { success: items.length > 0, items, errors }
}

/**
 * Import from JSON array
 * Expected format: [{ title, description?, tags?, type? }]
 */
export function importFromJSON(jsonText: string): ImportResult {
    const items: CardItem[] = []
    const errors: string[] = []

    try {
        const data = JSON.parse(jsonText)

        if (!Array.isArray(data)) {
            return { success: false, items: [], errors: ['JSON must be an array of tasks'] }
        }

        data.forEach((item, index) => {
            if (!item.title && !item.name && !item.task) {
                errors.push(`Item ${index + 1}: Missing title/name/task field`)
                return
            }

            const title = item.title || item.name || item.task
            const description = item.description || item.summary || item.content || title
            const tags = Array.isArray(item.tags) ? item.tags : ['Imported']
            const type = item.type === 'video' || item.type === 'article' || item.type === 'idea'
                ? item.type
                : 'task'

            items.push({
                id: crypto.randomUUID(),
                type,
                title: String(title).slice(0, 50),
                summary: String(description),
                url: item.url,
                tags: tags.length > 0 ? tags : ['Imported'],
                timeEstimate: item.timeEstimate || item.duration || 'Quick task',
                timestamp: Date.now()
            })
        })

        return { success: items.length > 0, items, errors }
    } catch (error) {
        return {
            success: false,
            items: [],
            errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
        }
    }
}

/**
 * Import from Markdown checklist format
 */
export function importFromMarkdown(mdText: string): ImportResult {
    const lines = mdText.split('\n')
    const items: CardItem[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
        // Match markdown checkboxes: - [ ] or - [x]
        const match = line.match(/^[-*]\s*\[[ x]\]\s*(.+)$/i)
        if (!match) return

        const content = match[1].trim()
        if (content.length < 3) {
            errors.push(`Line ${index + 1}: Task too short`)
            return
        }

        items.push({
            id: crypto.randomUUID(),
            type: 'task',
            title: content.slice(0, 50),
            summary: content,
            tags: ['Imported', 'Markdown'],
            timeEstimate: 'Quick task',
            timestamp: Date.now()
        })
    })

    return { success: items.length > 0, items, errors }
}

/**
 * Auto-detect format and import
 */
export function autoImport(text: string): ImportResult {
    // Try JSON first
    if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        const result = importFromJSON(text)
        if (result.success) return result
    }

    // Try CSV (check for commas and header-like first line)
    if (text.includes(',') && text.split('\n')[0]?.toLowerCase().includes('title')) {
        const result = importFromCSV(text)
        if (result.success) return result
    }

    // Try Markdown
    if (text.includes('- [ ]') || text.includes('- [x]')) {
        const result = importFromMarkdown(text)
        if (result.success) return result
    }

    // Default to plain text
    return importFromPlainText(text)
}
