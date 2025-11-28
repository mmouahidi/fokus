import type { CardItem } from '@/components/CardStack'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    // Explicit type overrides via hashtags
    if (lowerContent.includes('#task')) {
        return {
            title: content.replace('#task', '').trim().slice(0, 50),
            summary: content,
            type: 'task',
            timeEstimate: 'Quick task',
            estimatedMinutes: 15,
            tags: ['Task', 'Manual']
        }
    }

    if (lowerContent.includes('#article')) {
        return {
            title: content.replace('#article', '').trim().slice(0, 50),
            summary: content,
            type: 'article',
            timeEstimate: '5 min read',
            estimatedMinutes: 5,
            tags: ['Reading', 'Manual']
        }
    }

    if (lowerContent.includes('#video')) {
        return {
            title: content.replace('#video', '').trim().slice(0, 50),
            summary: content,
            type: 'video',
            timeEstimate: '10 min watch',
            estimatedMinutes: 10,
            tags: ['Video', 'Manual']
        }
    }

    if (lowerContent.includes('#idea')) {
        return {
            title: content.replace('#idea', '').trim().slice(0, 50),
            summary: content,
            type: 'idea',
            estimatedMinutes: 30,
            tags: ['Idea', 'Manual']
        }
    }

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
            title: 'Saved Article (New)',
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

// Get API key (Hardcoded for embedded use)
function getAPIKey(): string {
    return 'AIzaSyDhI2UWfxEiZFtnnrINRg6J2mVJAclZBVw'
}

// Initialize Gemini client (lazy loaded to avoid initialization errors)
let geminiClient: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
    const apiKey = getAPIKey()

    if (!apiKey) {
        throw new Error('No Gemini API key found. Please add your API key in Settings.')
    }

    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(apiKey)
    }
    return geminiClient
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

// Helper to fetch URL content via r.jina.ai
async function fetchUrlContent(url: string): Promise<string | null> {
    try {
        // Use r.jina.ai to get markdown representation
        const response = await fetch(`https://r.jina.ai/${url}`)
        if (!response.ok) return null
        return await response.text()
    } catch (error) {
        console.error('Failed to fetch URL content:', error)
        return null
    }
}

// Real AI processing using Gemini with retry logic
export async function realProcessCapture(content: string, model: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-flash'): Promise<ProcessResult> {
    // Validate model name and default to flash if invalid
    const validModels = ['gemini-1.5-pro', 'gemini-1.5-flash']
    const safeModel = validModels.includes(model) ? model : 'gemini-1.5-flash'

    try {
        const genAI = getGeminiClient()

        // Check if content is a URL
        const urlRegex = /^(http|https):\/\/[^ "]+$/;
        let finalContent = content;
        let isUrl = urlRegex.test(content.trim());

        if (isUrl) {
            const fetchedContent = await fetchUrlContent(content.trim());
            if (fetchedContent) {
                // Truncate to reasonable length (e.g. 20k chars) to avoid huge context usage
                // Gemini 1.5 has large context, but let's be safe and efficient
                finalContent = `URL: ${content}\n\nPage Content:\n${fetchedContent.slice(0, 20000)}`;
            }
        }

        const result = await retry(async () => {
            const prompt = `You are an AI assistant for a productivity app called FOKUS. 
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


Return ONLY the JSON object.

Input: ${finalContent}`

            const model = genAI.getGenerativeModel({ model: safeModel })
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            })

            const response = await result.response
            const text = response.text()
            const parsed = JSON.parse(text)

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
        console.error('Gemini API Error:', error)

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
    model: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-flash'
): Promise<CardItem> {
    // Check if API key exists, otherwise fall back to mock
    const hasApiKey = !!getAPIKey()

    const result = (useRealAi && hasApiKey)
        ? await realProcessCapture(content, model)
        : await mockProcessCapture(content)

    return {
        id: crypto.randomUUID(),
        ...result
    }
}
