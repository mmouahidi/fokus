import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, FileText, Clock, ExternalLink, Minimize2, Check, Sparkles, RotateCcw, Calendar } from 'lucide-react'
import type { CardItem } from './CardStack'
import { openInGoogleCalendar } from '@/lib/calendar'
import { useStore } from '@/lib/store'

interface ExecuteViewProps {
    item: CardItem
    onClose: () => void
    onComplete: () => void
}

// Enhanced video URL extraction supporting multiple platforms
function extractVideoId(item: CardItem): { platform: 'youtube' | 'vimeo' | null, id: string } {
    const sources = [item.url, item.content, item.summary].filter(Boolean)

    for (const source of sources) {
        if (!source) continue

        // YouTube patterns
        const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /v=([a-zA-Z0-9_-]{11})/
        ]

        for (const pattern of youtubePatterns) {
            const match = source.match(pattern)
            if (match) return { platform: 'youtube', id: match[1] }
        }

        // Vimeo patterns
        const vimeoMatch = source.match(/vimeo\.com\/(\d+)/)
        if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] }
    }

    return { platform: null, id: '' }
}

// Extract URL from item
function extractUrl(item: CardItem): string {
    if (item.url) return item.url
    const urlMatch = (item.content || item.summary || '').match(/https?:\/\/[^\s]+/)
    return urlMatch ? urlMatch[0] : '#'
}

export default function ExecuteView({ item, onClose, onComplete }: ExecuteViewProps) {
    const { updateItem } = useStore()
    const TIMER_DURATION = 25 * 60
    const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
    const [isActive, setIsActive] = useState(false)
    const [ideaText, setIdeaText] = useState(item.summary || '')
    const [showScheduler, setShowScheduler] = useState(false)
    const [scheduledDate, setScheduledDate] = useState(() => {
        if (item.scheduledDate) return item.scheduledDate.slice(0, 16)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        return tomorrow.toISOString().slice(0, 16)
    })
    const [duration, setDuration] = useState(item.scheduledDuration || item.estimatedMinutes || 60)

    // Timer logic for Task type
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            // TODO: Play completion sound
        }
        return () => clearInterval(interval)
    }, [isActive, timeLeft])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const renderContent = () => {
        switch (item.type) {
            case 'video':
                const video = extractVideoId(item)
                return (
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4">
                        {video.platform === 'youtube' ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                                title={item.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : video.platform === 'vimeo' ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://player.vimeo.com/video/${video.id}?autoplay=1`}
                                title={item.title}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                                <p>Video preview unavailable</p>
                                {extractUrl(item) !== '#' && (
                                    <a
                                        href={extractUrl(item)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open video link
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 'article':
                return (
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-gray-800/50 p-6 rounded-xl mb-4">
                            <h3 className="text-xl font-serif mb-4 text-gray-200">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {item.summary}
                                {/* In a real app, we'd fetch the full content here */}
                                <br /><br />
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>
                        <a
                            href={extractUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open original article
                        </a>
                    </div>
                )

            case 'task':
                return (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                            {/* Circular Progress */}
                            <svg className="absolute w-full h-full transform -rotate-90">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-gray-800"
                                />
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 120}
                                    strokeDashoffset={2 * Math.PI * 120 * (1 - timeLeft / TIMER_DURATION)}
                                    className="text-primary-500 transition-all duration-1000 ease-linear"
                                />
                            </svg>
                            <div className="text-5xl font-mono font-bold text-white">
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`px-8 py-3 rounded-full font-medium transition-all ${isActive
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                    }`}
                            >
                                {isActive ? 'Pause Timer' : 'Start Focus'}
                            </button>
                            <button
                                onClick={() => {
                                    setTimeLeft(TIMER_DURATION)
                                    setIsActive(false)
                                }}
                                className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                title="Reset timer"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )

            default: // Idea
                return (
                    <div className="bg-gray-800/50 p-6 rounded-xl min-h-[300px]">
                        <textarea
                            value={ideaText}
                            onChange={(e) => setIdeaText(e.target.value)}
                            className="w-full h-full min-h-[250px] bg-transparent border-none resize-none focus:ring-0 text-gray-200 placeholder-gray-600"
                            placeholder="Expand on your idea..."
                        />
                    </div>
                )
        }
    }

    const [notes, setNotes] = useState(item.notes || '')

    const handleComplete = () => {
        updateItem(item.id, { notes })
        onClose() // Close modal first
        onComplete() // Then trigger completion/archiving
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5`}>
                            {item.type === 'video' && <Play className="w-5 h-5 text-pink-400" />}
                            {item.type === 'article' && <FileText className="w-5 h-5 text-blue-400" />}
                            {item.type === 'task' && <Clock className="w-5 h-5 text-green-400" />}
                            {item.type === 'idea' && <Sparkles className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div>
                            <h2 className="font-semibold text-white line-clamp-1">{item.title}</h2>
                            <p className="text-xs text-gray-500 capitalize">{item.type} • {item.timeEstimate || 'No estimate'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderContent()}

                    {/* Notes Section */}
                    <section className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-primary-400" />
                            <h3 className="text-sm font-medium text-gray-300">
                                Key Takeaways & Notes
                            </h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What did you learn? Capture key insights here before completing..."
                            className="w-full p-4 bg-gray-950/50 border border-white/10 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all resize-none"
                            rows={4}
                        />
                    </section>
                </div>

                {/* Scheduler Modal */}
                {showScheduler && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-4">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-white/10">
                            <h3 className="text-lg font-bold text-white mb-4">Schedule in Google Calendar</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        min="15"
                                        step="15"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowScheduler(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const date = new Date(scheduledDate)
                                        updateItem(item.id, {
                                            scheduledDate: date.toISOString(),
                                            scheduledDuration: duration
                                        })
                                        openInGoogleCalendar(
                                            item.title,
                                            item.summary,
                                            date,
                                            duration
                                        )
                                        setShowScheduler(false)
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Add to Calendar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-white/5 flex justify-between gap-3 bg-gray-900/50">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowScheduler(true)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            title="Schedule in Google Calendar"
                        >
                            <Calendar className="w-4 h-4" />
                            {item.scheduledDate ? 'Reschedule' : 'Schedule'}
                        </button>
                        <button
                            onClick={() => {
                                updateItem(item.id, { notes })
                                onClose()
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Save for Later
                        </button>
                    </div>
                    <button
                        onClick={handleComplete}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Complete & Archive
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
