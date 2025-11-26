import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Sparkles, Clock, Zap, Loader2, AlertCircle, RefreshCw, Flame } from 'lucide-react'
import { useStore } from '@/lib/store'
import CaptureInput from '@/components/CaptureInput'
import { processContent } from '@/lib/ai'

export default function Home() {
    const {
        captures,
        items,
        isProcessing,
        settings,
        stats,
        addCapture,
        updateCapture,
        setProcessing,
        addItem,
        addError,
        getUnprocessedCaptures
    } = useStore()

    const recentItems = items.slice(0, 5)
    const pendingCount = captures.filter(c => !c.processed).length
    const failedCaptures = captures.filter(c => c.error)

    const handleCapture = (content: string) => {
        addCapture(content)
        // Play capture sound if enabled
        if (settings.soundEnabled) {
            import('@/lib/sounds').then(({ playSound }) => {
                playSound('capture', settings.soundEnabled)
            })
        }
    }

    const handleRetry = (id: string) => {
        updateCapture(id, { error: undefined, retryCount: 0 })
    }

    // Batch Processing Logic
    useEffect(() => {
        const processQueue = async () => {
            const unprocessed = getUnprocessedCaptures().filter(c => !c.error)
            if (unprocessed.length === 0 || isProcessing) return

            setProcessing(true)

            // Process up to 3 items at a time
            const batch = unprocessed.slice(0, 3)

            try {
                await Promise.all(batch.map(async (capture) => {
                    try {
                        const result = await processContent(capture.content, settings.aiMode === 'real', settings.model)

                        addItem({
                            id: crypto.randomUUID(),
                            type: result.type,
                            title: result.title,
                            summary: result.summary,
                            content: result.content,
                            url: result.url,
                            tags: result.tags,
                            timeEstimate: result.timeEstimate,
                            timestamp: Date.now() // For Rot System
                        })

                        updateCapture(capture.id, {
                            processed: true,
                            processedId: result.title // Using title as ID proxy for now
                        })
                    } catch (error) {
                        console.error(`Failed to process capture ${capture.id}:`, error)
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                        updateCapture(capture.id, { error: errorMessage })
                        addError(capture.id, errorMessage)
                    }
                }))
            } finally {
                setProcessing(false)
            }
        }

        const interval = setInterval(processQueue, 1000)
        return () => clearInterval(interval)
    }, [captures, isProcessing, settings, addItem, updateCapture, setProcessing, addError, getUnprocessedCaptures])

    return (
        <div className="max-w-2xl mx-auto p-4 pt-12 pb-24">
            {/* Header */}
            <header className="mb-12 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4">
                    <Brain className="w-8 h-8 text-primary-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">FOKUS</h1>
                <p className="text-gray-400 text-lg">Capture now. Execute later.</p>

                {/* Streak Display */}
                {stats.streak > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-sm font-medium text-orange-400">{stats.streak} Day Streak</span>
                    </div>
                )}
            </header>

            {/* Capture Input */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-primary-400" />
                    <h2 className="text-sm font-medium text-gray-300">Quick Capture</h2>
                </div>
                <CaptureInput onSubmit={handleCapture} />
            </section>

            {/* AI Processing Status */}
            <section className="mb-8">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Sparkles className="w-12 h-12 text-indigo-400" />
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-indigo-300">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <h3 className="text-sm font-semibold">Processing {pendingCount} item{pendingCount !== 1 ? 's' : ''}...</h3>
                            </div>
                            <p className="text-xs text-gray-400">Using {settings.aiMode === 'real' ? settings.model : 'mock AI'}</p>
                            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mt-1">
                                <motion.div
                                    className="h-full bg-indigo-500 rounded-full"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-sm font-semibold text-indigo-300 mb-1">AI Processor Idle</h3>
                            <p className="text-xs text-gray-400 mb-3">
                                Mode: {settings.aiMode === 'real' ? `Real (${settings.model})` : 'Mock'}
                            </p>
                            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full w-1/3 bg-indigo-500 rounded-full opacity-50"></div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Failed Items */}
            {failedCaptures.length > 0 && (
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <h2 className="text-sm font-medium text-gray-300">Failed to Process</h2>
                    </div>
                    <div className="space-y-2">
                        {failedCaptures.map((capture) => (
                            <motion.div
                                key={capture.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl"
                            >
                                <p className="text-xs text-gray-400 mb-1 line-clamp-1">{capture.content}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-red-400">{capture.error}</p>
                                    <button
                                        onClick={() => handleRetry(capture.id)}
                                        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Retry
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Items */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-medium text-gray-300">Recent Items</h2>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {recentItems.length > 0 ? (
                            recentItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-4 bg-gray-900/50 border border-white/5 rounded-xl flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Favicon for URLs */}
                                        {item.url && (
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=32`}
                                                alt=""
                                                className="w-5 h-5 mt-0.5 flex-shrink-0 rounded"
                                                onError={(e) => { e.currentTarget.style.display = 'none' }}
                                            />
                                        )}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-200 line-clamp-1">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.summary}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-400 capitalize flex-shrink-0">
                                        {item.type}
                                    </span>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <p className="text-xs text-gray-500">No recent items</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    )
}
