import type { CardItem } from '@/components/CardStack'

/**
 * Helper to trigger file download
 */
export function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

/**
 * Export items to Markdown format (compatible with Obsidian)
 * Creates a single file with headers for each item
 */
export function exportToMarkdown(items: CardItem[]): string {
    const timestamp = new Date().toISOString().split('T')[0]
    let content = `# FOKUS Archive Export - ${timestamp}\n\n`

    items.forEach(item => {
        const date = item.archivedAt
            ? new Date(item.archivedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

        content += `## ${item.title}\n\n`

        // Frontmatter-like metadata block
        content += `> [!info] Metadata\n`
        content += `> - **Type**: ${item.type}\n`
        content += `> - **Date**: ${date}\n`
        content += `> - **Tags**: #${item.tags.join(' #')} #fokus-archive\n`
        if (item.url) content += `> - **URL**: ${item.url}\n`
        content += `\n`

        if (item.summary) {
            content += `### Summary\n${item.summary}\n\n`
        }

        if (item.notes) {
            content += `### 📝 Notes\n${item.notes}\n\n`
        }

        if (item.content) {
            content += `### Content\n${item.content}\n\n`
        }

        content += `---\n\n`
    })

    return content
}

/**
 * Export items to CSV format (compatible with Notion)
 */
export function exportToCSV(items: CardItem[]): string {
    // Define headers
    const headers = [
        'Title',
        'Type',
        'Summary',
        'Notes',
        'Tags',
        'URL',
        'Date Archived',
        'Status'
    ]

    // Helper to escape CSV fields
    const escape = (text: string | undefined) => {
        if (!text) return '""'
        const escaped = text.replace(/"/g, '""') // Escape double quotes
        return `"${escaped}"`
    }

    let content = headers.join(',') + '\n'

    items.forEach(item => {
        const row = [
            escape(item.title),
            escape(item.type),
            escape(item.summary),
            escape(item.notes),
            escape(item.tags.join(', ')),
            escape(item.url),
            escape(item.archivedAt ? new Date(item.archivedAt).toISOString() : ''),
            escape('Archived')
        ]
        content += row.join(',') + '\n'
    })

    return content
}

/**
 * Export items to JSON format (Raw data)
 */
export function exportToJSON(items: CardItem[]): string {
    return JSON.stringify(items, null, 2)
}
