import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface CardItem {
    id: string
    type: 'video' | 'article' | 'task' | 'idea'
    title: string
    summary: string
    content?: string
    url?: string
    tags: string[]
    timeEstimate?: string
    estimatedMinutes?: number // AI-predicted duration in minutes
    timestamp?: number // For Rot System
    error?: string // For AI processing errors
    kanbanColumn?: 'now' | 'soon' | 'later' | 'someday' // For Kanban board
    scheduledDate?: string // ISO 8601 format for Google Calendar integration
    scheduledDuration?: number // Duration in minutes
}

const getTypeColors = (type: CardItem['type']) => {
    switch (type) {
        case 'video': return { bg: 'from-red-900/80 to-gray-900', border: 'border-red-500/50', badge: 'bg-red-500/20 text-red-300' }
        case 'article': return { bg: 'from-blue-900/80 to-gray-900', border: 'border-blue-500/50', badge: 'bg-blue-500/20 text-blue-300' }
        case 'task': return { bg: 'from-emerald-900/80 to-gray-900', border: 'border-emerald-500/50', badge: 'bg-emerald-500/20 text-emerald-300' }
        case 'idea': return { bg: 'from-amber-900/80 to-gray-900', border: 'border-amber-500/50', badge: 'bg-amber-500/20 text-amber-300' }
    }
}

// Rot System Logic with granular stages
type RotStatus = 'fresh' | 'aging' | 'stale' | 'rotting' | 'decayed'

const getRotStatus = (timestamp?: number): RotStatus => {
    if (!timestamp) return 'fresh'
    const age = Date.now() - timestamp
    const hours = age / (1000 * 60 * 60)

    if (hours < 12) return 'fresh'
    if (hours < 24) return 'aging'
    if (hours < 48) return 'stale'
    if (hours < 72) return 'rotting'
    return 'decayed'
}

const getAgeDisplay = (timestamp?: number): string | null => {
    if (!timestamp) return null
    const age = Date.now() - timestamp
    const hours = Math.floor(age / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d old`
    if (hours > 0) return `${hours}h old`
    return 'just now'
}

function Card({ item, index, active, onSwipe }: { item: CardItem, index: number, active: boolean, onSwipe: (dir: 'left' | 'right' | 'up') => void }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

    // Swipe Feedback
    const bgRight = useTransform(x, [0, 150], ['rgba(0,0,0,0)', 'rgba(16, 185, 129, 0.2)']) // Green for Execute
    const bgLeft = useTransform(x, [-150, 0], ['rgba(239, 68, 68, 0.2)', 'rgba(0,0,0,0)']) // Red for Incinerate

    // Text Feedback Opacity
    const executeOpacity = useTransform(x, [50, 150], [0, 1])
    const incinerateOpacity = useTransform(x, [-150, -50], [1, 0])

    const controls = useAnimation()
    const typeColors = getTypeColors(item.type)
    const rotStatus = getRotStatus(item.timestamp)

    const handleDragEnd = async (_: any, info: any) => {
        const offset = info.offset.x
        const velocity = info.velocity.x

        if (offset > 100 || velocity > 500) {
            await controls.start({ x: 500, opacity: 0 })
            onSwipe('right')
        } else if (offset < -100 || velocity < -500) {
            // Incinerate Animation
            await controls.start({
                x: -200,
                scale: 0.5,
                opacity: 0,
                transition: { duration: 0.4 }
            })
            onSwipe('left')
        } else {
            controls.start({ x: 0, y: 0 })
        }
    }

    // Progressive Rot Visuals
    const rotStyles: Record<RotStatus, string> = {
        fresh: '',
        aging: 'grayscale-[15%] contrast-[0.95]',
        stale: 'grayscale-[40%] contrast-[0.9] brightness-[0.95]',
        rotting: 'grayscale-[70%] contrast-[0.85] brightness-[0.9] border-amber-800/60',
        decayed: 'grayscale-[95%] contrast-[0.75] brightness-[0.85] border-red-900/70 bg-red-950/20'
    }

    return (
        <motion.div
            style={{
                x,
                y,
                rotate,
                opacity,
                zIndex: 100 - index
            }}
            drag={active ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            animate={controls}
            initial={{ scale: 1 - index * 0.05, y: index * 10 }}
            className={`absolute w-full max-w-sm aspect-[3/4] cursor-grab active:cursor-grabbing perspective-1000`}
        >
            <div
                className={`relative w-full h-full rounded-3xl border border-white/10 overflow-hidden shadow-2xl ${rotStyles[rotStatus]}`}
                style={{
                    filter: index > 0 ? `blur(${index * 1}px)` : 'none'
                }}
            >
                {/* Progressive Swipe Indicators */}
                <motion.div
                    style={{ opacity: executeOpacity }}
                    className={`absolute top-8 left-8 z-10 border-4 ${typeColors.border} rounded-lg px-4 py-2 -rotate-12 bg-black/50 backdrop-blur-sm`}
                >
                    <span className="text-primary-400 font-bold text-2xl uppercase tracking-widest">Execute</span>
                </motion.div>
                <motion.div
                    style={{ opacity: incinerateOpacity }}
                    className="absolute top-8 right-8 z-10 border-4 border-red-500 rounded-lg px-4 py-2 rotate-12 bg-black/50 backdrop-blur-sm"
                >
                    <span className="text-red-500 font-bold text-2xl uppercase tracking-widest">Incinerate</span>
                </motion.div>

                {/* Card Content */}
                <div className={`h-full flex flex-col p-6 bg-gradient-to-b ${typeColors.bg} backdrop-blur-xl`}>
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${typeColors.badge} uppercase tracking-wider`}>
                            {item.type}
                        </span>
                        <div className="flex items-center gap-2">
                            {rotStatus !== 'fresh' && (
                                <div className={`flex items-center text-xs ${rotStatus === 'decayed' ? 'text-red-500/90' :
                                    rotStatus === 'rotting' ? 'text-amber-500/80' :
                                        rotStatus === 'stale' ? 'text-amber-500/60' :
                                            'text-gray-400/60'
                                    }`} title={`Item is ${rotStatus}`}>
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    <span className="capitalize">{getAgeDisplay(item.timestamp)}</span>
                                </div>
                            )}
                            {item.timeEstimate && (
                                <div className="flex items-center text-gray-400 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {item.timeEstimate}
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{item.title}</h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6 flex-1 line-clamp-[8]">{item.summary}</p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {item.tags.map((tag: string) => (
                            <span key={tag} className="text-xs text-primary-400 font-medium">#{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Background Gradients for Swipe Feedback */}
                <motion.div style={{ background: bgRight }} className="absolute inset-0 pointer-events-none" />
                <motion.div style={{ background: bgLeft }} className="absolute inset-0 pointer-events-none" />
            </div>
        </motion.div>
    )
}

export default function CardStack({ items, onSwipe }: { items: CardItem[], onSwipe: (id: string, direction: 'left' | 'right' | 'up') => void }) {
    const navigate = useNavigate()

    return (
        <div className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center">
            {items.map((item, index) => (
                <Card
                    key={item.id}
                    item={item}
                    index={index}
                    active={index === 0}
                    onSwipe={(dir) => onSwipe(item.id, dir)}
                />
            ))}
            {items.length === 0 && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center flex flex-col items-center gap-6"
                >
                    <div>
                        <div className="mb-4 text-6xl">🎉</div>
                        <p className="text-2xl font-bold text-white mb-2">All caught up!</p>
                        <p className="text-gray-400">Check back later for more.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/capture')}
                            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-medium transition-colors"
                        >
                            Capture New
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
