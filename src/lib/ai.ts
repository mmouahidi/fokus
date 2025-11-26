import type { CardItem } from '@/components/CardStack'
import OpenAI from 'openai'

export interface ProcessResult {
    title: string
    summary: string
    type: 'article' | 'video' | 'idea' | 'task'
    timeEstimate?: string
    estimatedMinutes?: number // Duration in minutes for calendar scheduling
    tags: string[]
    error?: string
}

// Mock AI processing for development/testing
export async function mockProcessCapture(content: string): Promise<ProcessResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const lowerContent = content.toLowerCase()

    // Simple heuristic-based categorization
    if (lowerContent.includes('http') || lowerContent.includes('www')) {
        if (lowerContent.includes('youtube') || lowerContent.includes('vimeo')) {
            return {
                title: 'Video Content',
                summary: `Video link: ${content}`,
                type: 'video',
                timeEstimate: '10 min watch',
                estimatedMinutes: 10,
                tags: ['Video', 'Watch Later']
            }
        }
        return {
            title: 'Saved Article',
            summary: `Link: ${content}`,
            type: 'article',
            timeEstimate: '5 min read',
            estimatedMinutes: 5,
            tags: ['Reading', 'Internet']
        }
    }

    if (lowerContent.startsWith('todo') || lowerContent.startsWith('- [ ]')) {
        return {
            title: content.replace(/^(todo|- \[ \])\s*/i, '').slice(0, 50),
            summary: content,
            type: 'task',
            timeEstimate: 'Quick task',
            estimatedMinutes: 15,
            tags: ['Task', 'Todo']
        }
    }

    return {
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        summary: content,
        type: 'idea',
        estimatedMinutes: 30,
        tags: ['Idea', 'Thought']
    }
}

// Initialize OpenAI client (lazy loaded to avoid initialization errors)
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        })
    }
    return openaiClient
}

// Retry helper with exponential backoff
async function retry<T>(
    fn: () => Promise<T>,
    maxRetries = 2,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error | null = null

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            // Don't retry on certain errors
            if (error instanceof Error && (
                error.message.includes('API key') ||
                error.message.includes('quota') ||
                error.message.includes('401')
            )) {
                throw error
            }

            if (i < maxRetries) {
                const delay = baseDelay * Math.pow(2, i)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError
}

// Real AI processing using OpenAI with retry logic
export async function realProcessCapture(content: string, model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o'): Promise<ProcessResult> {
    try {
        const openai = getOpenAIClient()

        const result = await retry(async () => {
            const completion = await openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant for a productivity app called FOKUS. 
            Your job is to analyze captured text and organize it into a structured format.
            
            Analyze the input and return a JSON object with:
            - title: A short, punchy title (max 50 chars)
            - summary: A brief summary of the content (max 100 chars)
            - type: One of 'article', 'video', 'idea', 'task'
            - timeEstimate: Estimated time to read/watch/complete (MUST be a string like "15 min", "1 hour", "30 min")
            - estimatedMinutes: Estimated duration as a NUMBER in minutes (e.g., 15, 60, 30) - used for calendar scheduling
            - tags: Array of 2-4 relevant tags
            
            Rules for 'type':
            - 'video': YouTube/Vimeo links or content clearly about watching something
            - 'article': Blog posts, news links, or long reading content
            - 'task': Actionable items, todos, or things starting with verbs
            - 'idea': Thoughts, notes, or concepts to explore
            
            Duration estimation guidelines:
            - Videos: Estimate based on typical YouTube video lengths (10-30 min typical)
            - Articles: ~200 words per minute, estimate based on content length
            - Tasks: Simple tasks 15-30 min, complex tasks 1-2 hours, quick tasks 5-10 min
            - Ideas: 15-30 min for initial exploration
            
            Return ONLY the JSON object.`
                    },
                    {
                        role: "user",
                        content: content
                    }
                ],
                model: model,
                response_format: { type: "json_object" }
            })

            const parsed = JSON.parse(completion.choices[0].message.content || '{}')

            return {
                title: parsed.title || 'Untitled',
                summary: parsed.summary || content.slice(0, 100),
                type: parsed.type || 'idea',
                timeEstimate: parsed.timeEstimate,
                estimatedMinutes: parsed.estimatedMinutes || 60, // Default to 60 min if not provided
                tags: parsed.tags || []
            }
        })

        return result
    } catch (error) {
        console.error('OpenAI API Error:', error)

        // Return result with error flag
        const fallbackResult = await mockProcessCapture(content)
        return {
            ...fallbackResult,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Main entry point
export async function processContent(
    content: string,
    useRealAi = true,
    model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o'
): Promise<CardItem> {
    // Check if API key exists, otherwise fall back to mock
    const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

    const result = (useRealAi && hasApiKey)
        ? await realProcessCapture(content, model)
        : await mockProcessCapture(content)

    return {
        id: crypto.randomUUID(),
        ...result
    }
}
