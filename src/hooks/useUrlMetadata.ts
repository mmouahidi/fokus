import { useState, useEffect } from 'react'

export interface UrlMetadata {
    title?: string
    description?: string
    image?: string
    favicon?: string
    url: string
}

export function useUrlMetadata(url: string | null): {
    metadata: UrlMetadata | null
    loading: boolean
    error: string | null
} {
    const [metadata, setMetadata] = useState<UrlMetadata | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!url) {
            setMetadata(null)
            return
        }

        // Simple URL validation
        try {
            new URL(url)
        } catch {
            setError('Invalid URL')
            return
        }

        const fetchMetadata = async () => {
            setLoading(true)
            setError(null)

            try {
                // For now, we'll use a CORS proxy or just extract basic info
                // In production, you'd want a backend service to fetch this
                // For demo purposes, we'll create mock metadata based on the URL

                const urlObj = new URL(url)
                const domain = urlObj.hostname.replace('www.', '')

                // Mock metadata - in production, use OpenGraph API or backend
                const mockMetadata: UrlMetadata = {
                    title: `Content from ${domain}`,
                    description: `Shared link: ${url}`,
                    url: url,
                    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                }

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500))

                setMetadata(mockMetadata)
            } catch (err) {
                setError('Failed to fetch metadata')
                console.error('Error fetching metadata:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchMetadata()
    }, [url])

    return { metadata, loading, error }
}
