import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import CaptureInput from '@/components/CaptureInput'
import { useUrlMetadata } from '@/hooks/useUrlMetadata'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function Capture() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [initialValue, setInitialValue] = useState('')
    const [detectedUrl, setDetectedUrl] = useState<string | null>(null)
    const [, setRecentCaptures] = useLocalStorage<string[]>('fokus-recent-captures', [])
    const { metadata, loading } = useUrlMetadata(detectedUrl)

    useEffect(() => {
        const title = searchParams.get('title')
        const text = searchParams.get('text')
        const url = searchParams.get('url')

        const parts = []
        if (title) parts.push(title)
        if (text) parts.push(text)
        if (url) {
            parts.push(url)
            setDetectedUrl(url)
        }

        if (parts.length > 0) {
            setInitialValue(parts.join('\n\n'))
        }
    }, [searchParams])

    const handleCapture = (value: string) => {
        console.log('Captured from share:', value)

        // Save to localStorage
        setRecentCaptures(prev => [value, ...prev].slice(0, 10))

        // Navigate back to home
        navigate('/')
    }

    return (
        <div className="min-h-full p-4 pt-8 pb-24">
            <header className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold text-white">Capture</h1>
            </header>

            <div className="flex flex-col gap-6">
                {/* URL Metadata Preview */}
                {detectedUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/50 border border-white/10 rounded-xl p-4 backdrop-blur-xl"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Fetching link preview...</span>
                            </div>
                        ) : metadata ? (
                            <div className="flex gap-3">
                                {metadata.favicon && (
                                    <img
                                        src={metadata.favicon}
                                        alt=""
                                        className="w-12 h-12 rounded-lg bg-gray-800 p-2"
                                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white truncate">{metadata.title}</h3>
                                    <p className="text-xs text-gray-400 truncate">{metadata.description}</p>
                                    <a
                                        href={metadata.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 mt-1"
                                    >
                                        {new URL(metadata.url).hostname}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ) : null}
                    </motion.div>
                )}

                <CaptureInput
                    initialValue={initialValue}
                    onSubmit={handleCapture}
                    className="w-full"
                />

                <div className="text-center text-xs text-gray-500">
                    <p>Shared content will appear here automatically.</p>
                </div>
            </div>
        </div>
    )
}
