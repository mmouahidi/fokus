import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Edit, Tag, CheckSquare, Trash2 } from 'lucide-react'
import CardStack, { type CardItem } from '@/components/CardStack'
import { useStore } from '@/lib/store'
import ExecuteView from '@/components/ExecuteView'
import EditItemModal from '@/components/EditItemModal'
import TagManager from '@/components/TagManager'
import { playSound } from '@/lib/sounds'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

export default function Review() {
    const { items, removeItem, incrementStats, settings, updateItem, removeItems, archiveItem } = useStore()
    const [activeItem, setActiveItem] = useState<CardItem | null>(null)
    const [editingItem, setEditingItem] = useState<CardItem | null>(null)
    const [showTagManager, setShowTagManager] = useState(false)
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'article' | 'video' | 'idea' | 'task'>('all')
    const [classificationFilter, setClassificationFilter] = useState<'all' | 'action' | 'reference'>('all')
    const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
    const [showArchived, setShowArchived] = useState(false)

    // Filter items based on search, type, date, and archive status
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Archive filter
            if (!showArchived && item.archived) return false
            if (showArchived && !item.archived) return false

            // Classification Filter
            if (classificationFilter === 'action' && item.type !== 'task') return false
            if (classificationFilter === 'reference' && item.type === 'task') return false

            const matchesSearch = searchQuery === '' ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesType = filterType === 'all' || item.type === filterType

            // Date filter
            let matchesDate = true
            if (dateRange !== 'all') {
                const date = new Date(item.timestamp || Date.now())
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - date.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (dateRange === 'today') matchesDate = diffDays <= 1
                if (dateRange === 'week') matchesDate = diffDays <= 7
                if (dateRange === 'month') matchesDate = diffDays <= 30
            }

            return matchesSearch && matchesType && matchesDate
        })
    }, [items, showArchived, classificationFilter, searchQuery, filterType, dateRange])

    const handleSwipe = (id: string, direction: 'left' | 'right' | 'up') => {
        if (direction === 'right') {
            const item = items.find(i => i.id === id)
            if (item) {
                setActiveItem(item)
                playSound('swipeRight', settings.soundEnabled)
            }
        } else if (direction === 'left') {
            removeItem(id)
            playSound('swipeLeft', settings.soundEnabled)
        } else {
            removeItem(id)
        }
    }

    const handleComplete = () => {
        if (activeItem) {
            setActiveItem(null) // Close modal first
            archiveItem(activeItem.id) // Then archive the item
            incrementStats()
            playSound('complete', settings.soundEnabled)
        }
    }

    const handleEditItem = (updates: Partial<CardItem>) => {
        if (editingItem) {
            updateItem(editingItem.id, updates)
        }
    }

    const handleBulkDelete = () => {
        if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} items?`)) {
            removeItems(selectedIds)
            setSelectedIds([])
            setSelectMode(false)
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredItems.length === 0 || activeItem || selectMode) return

            if (e.key === ' ') {
                e.preventDefault()
                handleSwipe(filteredItems[0].id, 'right')
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                handleSwipe(filteredItems[0].id, 'left')
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                handleSwipe(filteredItems[0].id, 'up')
            } else if (e.key === 'e') {
                e.preventDefault()
                setEditingItem(filteredItems[0])
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [filteredItems, activeItem, selectMode, removeItem])

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-12 pb-32">
            <header className="mb-8 text-center">
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-500 text-sm mb-2"
                >
                    {getGreeting()}
                </motion.p>
                <h1 className="text-3xl font-bold text-white mb-2">Review Queue</h1>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={filteredItems.length}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-accent-400 text-lg font-semibold"
                    >
                        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} {searchQuery || filterType !== 'all' ? 'found' : 'remaining'}
                    </motion.p>
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="w-full max-w-md mt-4 flex items-center gap-2 justify-center">
                    <button
                        onClick={() => setShowTagManager(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                        <Tag className="w-4 h-4" />
                        <span className="hidden sm:inline">Manage Tags</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectMode(!selectMode)
                            setSelectedIds([])
                        }}
                        className={`flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg text-sm transition-colors ${selectMode
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
                            }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">{selectMode ? 'Cancel' : 'Select'}</span>
                    </button>
                    {selectMode && selectedIds.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-sm text-red-300 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedIds.length})
                        </motion.button>
                    )}
                </div>

                {/* Search and Filter */}
                <div className="w-full max-w-md mt-6 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search title, notes, tags..."
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col gap-2">
                        {/* Classification Filter (New) */}
                        <div className="flex p-1 bg-gray-800/50 rounded-xl border border-white/10">
                            {(['all', 'action', 'reference'] as const).map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => {
                                        // Reset specific type filter when changing classification
                                        setFilterType('all')
                                        // We need a new state for classification or derive it?
                                        // Let's add a new state for classification filter
                                        setClassificationFilter(cls)
                                    }}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${classificationFilter === cls
                                        ? 'bg-gray-700 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    {cls.charAt(0).toUpperCase() + cls.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Type Filters (Conditional based on classification?) */}
                        {/* Actually, let's keep them but filter them visually or logically? 
                           If I select "Action", only "Task" should be available/visible.
                           If "Reference", only "Article", "Video", "Idea".
                           Let's just filter the list for now.
                        */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            {(['all', 'task', 'article', 'video', 'idea'] as const).map(type => {
                                // Hide types that don't match current classification
                                if (classificationFilter === 'action' && type !== 'task' && type !== 'all') return null
                                if (classificationFilter === 'reference' && type === 'task') return null

                                return (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${filterType === type
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Date & Archive Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <div className="w-4 h-4 flex-shrink-0" /> {/* Spacer alignment */}
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as any)}
                                className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>

                            <button
                                onClick={() => setShowArchived(!showArchived)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border border-white/10 ${showArchived
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {showArchived ? 'Hiding Archived' : 'Show Archived'}
                            </button>
                        </div>
                    </div>
                </div>

                {filteredItems.length > 0 && !selectMode && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500 text-xs mt-2"
                    >
                        Swipe right to execute • Swipe left to incinerate • Press 'e' to edit
                    </motion.p>
                )}
            </header>

            {!selectMode ? (
                <CardStack items={filteredItems} onSwipe={handleSwipe} />
            ) : (
                <div className="w-full max-w-2xl mt-8 flex flex-col gap-3">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => {
                                setSelectedIds(prev =>
                                    prev.includes(item.id)
                                        ? prev.filter(id => id !== item.id)
                                        : [...prev, item.id]
                                )
                            }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                selectedIds.includes(item.id)
                                    ? 'bg-primary-500/20 border-primary-500/50'
                                    : 'bg-gray-800/50 border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border ${
                                selectedIds.includes(item.id)
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-gray-500'
                            }`}>
                                {selectedIds.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-sm font-semibold text-white line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-gray-400 line-clamp-1">{item.summary}</p>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-8">No items match your filters.</p>
                    )}
                </div>
            )}

            {filteredItems.length > 0 && !selectMode && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex gap-8 text-gray-500 text-sm"
                >
                    <button
                        onClick={() => filteredItems[0] && handleSwipe(filteredItems[0].id, 'left')}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                            <span className="text-xl">✕</span>
                        </div>
                        <span className="text-xs">Incinerate</span>
                        <span className="text-[10px] text-gray-600">Delete</span>
                    </button>
                    <button
                        onClick={() => filteredItems[0] && setEditingItem(filteredItems[0])}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-500 hover:bg-red-500/10 transition-colors">
                            <Edit className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Edit</span>
                        <span className="text-[10px] text-gray-600">E</span>
                    </button>
                    <button
                        onClick={() => filteredItems[0] && handleSwipe(filteredItems[0].id, 'right')}
                        className="flex flex-col items-center gap-1"
                    >
                        <div className="w-12 h-12 rounded-full border border-primary-500/30 flex items-center justify-center text-primary-500 hover:bg-primary-500/10 transition-colors">
                            <span className="text-xl">✓</span>
                        </div>
                        <span className="text-xs">Execute</span>
                        <span className="text-[10px] text-gray-600">Space</span>
                    </button>
                </motion.div>
            )}

            {/* Tag Manager Modal */}
            <TagManager
                isOpen={showTagManager}
                onClose={() => setShowTagManager(false)}
            />

            {/* Edit Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleEditItem}
                />
            )}

            {/* Execute Modal */}
            <AnimatePresence>
                {activeItem && (
                    <ExecuteView
                        item={activeItem}
                        onClose={() => setActiveItem(null)}
                        onComplete={handleComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
