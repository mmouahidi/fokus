import { useState, useEffect, useMemo, useCallback } from 'react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable
} from '@dnd-kit/core'
import { Sparkles, LayoutGrid, Search, X, Clock, Tag as TagIcon, Plus } from 'lucide-react'
import { useStore } from '@/lib/store'
import { type CardItem } from '@/components/CardStack'
import { autoCategorizeItems, recategorizeAllItems, type KanbanColumn } from '@/lib/ai-categorizer'
import { detectTopics, filterByTopic, suggestTagsForItem, type Topic } from '@/lib/ai-topics'

const COLUMNS: { id: KanbanColumn; title: string; color: string; icon: string }[] = [
    { id: 'now', title: 'NOW', color: 'border-red-500/50 bg-red-500/5', icon: '🔴' },
    { id: 'soon', title: 'SOON', color: 'border-orange-500/50 bg-orange-500/5', icon: '🟠' },
    { id: 'later', title: 'LATER', color: 'border-yellow-500/50 bg-yellow-500/5', icon: '🟡' },
    { id: 'someday', title: 'SOMEDAY', color: 'border-gray-500/50 bg-gray-500/5', icon: '⚪' }
]

export default function Kanban() {
    const { items, moveItemToColumn, updateItem } = useStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isAutoSorting, setIsAutoSorting] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
    const [detectedTopics, setDetectedTopics] = useState<Topic[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    // Auto-categorize new items on mount
    useEffect(() => {
        const uncategorized = items.filter(item => !item.kanbanColumn)
        if (uncategorized.length > 0) {
            const categorized = autoCategorizeItems(uncategorized)
            categorized.forEach(item => {
                if (item.kanbanColumn) {
                    moveItemToColumn(item.id, item.kanbanColumn)
                }
            })
        }
    }, [items.length])

    // Detect topics whenever items change - memoized to prevent recalculation
    const topics = useMemo(() => detectTopics(items), [items])

    useEffect(() => {
        setDetectedTopics(topics)
    }, [topics])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const itemId = active.id as string
            const newColumn = over.id as KanbanColumn

            // Only move if it's a column (not another item)
            if (['now', 'soon', 'later', 'someday'].includes(newColumn)) {
                moveItemToColumn(itemId, newColumn)
            }
        }

        setActiveId(null)
    }

    const handleAISort = useCallback(() => {
        setIsAutoSorting(true)
        const recategorized = recategorizeAllItems(items)

        recategorized.forEach(item => {
            if (item.kanbanColumn) {
                moveItemToColumn(item.id, item.kanbanColumn)
            }
        })

        setTimeout(() => setIsAutoSorting(false), 1000)
    }, [items, moveItemToColumn])

    // Memoize filtered items to prevent recalculation on every render
    const getFilteredItems = useCallback((column: KanbanColumn) => {
        let columnItems = items.filter(item => item.kanbanColumn === column)

        // Apply topic filter
        if (selectedTopic) {
            columnItems = filterByTopic(columnItems, selectedTopic)
        }

        // Apply search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            columnItems = columnItems.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.summary.toLowerCase().includes(lowerQuery) ||
                item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            )
        }

        return columnItems
    }, [items, selectedTopic, searchQuery])

    const activeItem = activeId ? items.find(i => i.id === activeId) : null

    return (
        <div className="min-h-screen p-4 pt-12">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <LayoutGrid className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">FOKUS Board</h1>
                            <p className="text-sm text-gray-400">AI-organized task board</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAISort}
                        disabled={isAutoSorting}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                    >
                        <Sparkles className={`w-4 h-4 ${isAutoSorting ? 'animate-spin' : ''}`} />
                        AI Sort
                    </motion.button>
                </div>

                {/* Topics Filter */}
                {detectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {detectedTopics.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedTopic === topic.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-800/50 border border-white/10 text-gray-300 hover:border-primary-500/50'
                                    }`}
                            >
                                <span>{topic.emoji}</span>
                                <span>{topic.name}</span>
                                <span className="text-gray-400">({topic.count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search all boards..."
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
            </header>

            {/* Kanban Board */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {COLUMNS.map(column => {
                        const columnItems = getFilteredItems(column.id)

                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                items={columnItems}
                                allItems={items}
                                onAddTag={(itemId, tag) => {
                                    const item = items.find(i => i.id === itemId)
                                    if (item) {
                                        updateItem(itemId, {
                                            tags: [...item.tags, tag]
                                        })
                                    }
                                }}
                            />
                        )
                    })}
                </div>

                <DragOverlay>
                    {activeItem && <KanbanCard item={activeItem} isDragging />}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

// Kanban Column Component
interface KanbanColumnProps {
    column: typeof COLUMNS[0]
    items: CardItem[]
    allItems: CardItem[]
    onAddTag: (itemId: string, tag: string) => void
}

const KanbanColumn = React.memo(({ column, items, allItems, onAddTag }: KanbanColumnProps) => {
    const { setNodeRef } = useDroppable({
        id: column.id
    })

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col min-h-[500px] border-2 rounded-xl p-4 ${column.color}`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{column.icon}</span>
                    <h2 className="text-lg font-bold text-white">{column.title}</h2>
                </div>
                <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">
                    {items.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto">
                {items.map(item => (
                    <KanbanCard
                        key={item.id}
                        item={item}
                        allItems={allItems}
                        onAddTag={onAddTag}
                    />
                ))}

                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        <p>No items</p>
                        <p className="text-xs mt-1">Drag items here</p>
                    </div>
                )}
            </div>
        </div>
    )
})

// Kanban Card Component
interface KanbanCardProps {
    item: CardItem
    allItems?: CardItem[]
    onAddTag?: (itemId: string, tag: string) => void
    isDragging?: boolean
}

const KanbanCard = React.memo(({ item, allItems, onAddTag, isDragging = false }: KanbanCardProps) => {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestedTags, setSuggestedTags] = useState<string[]>([])
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: item.id
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    const typeColors = {
        video: 'bg-red-500/20 text-red-300 border-red-500/30',
        article: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        task: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        idea: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-4 bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02] ${isDragging ? 'opacity-50' : ''
                }`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white line-clamp-2 flex-1">
                    {item.title}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${typeColors[item.type]}`}>
                    {item.type}
                </span>
            </div>

            {/* Summary */}
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                {item.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                    {item.timeEstimate && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.timeEstimate}</span>
                        </div>
                    )}
                    {item.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                            <TagIcon className="w-3 h-3" />
                            <span>{item.tags[0]}</span>
                            {item.tags.length > 1 && (
                                <span className="text-gray-600">+{item.tags.length - 1}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tag Suggestions Button */}
                {allItems && onAddTag && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (!showSuggestions) {
                                const suggestions = suggestTagsForItem(item, allItems)
                                setSuggestedTags(suggestions)
                            }
                            setShowSuggestions(!showSuggestions)
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        title="Suggest tags"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Tag Suggestions */}
            <AnimatePresence>
                {showSuggestions && suggestedTags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                    >
                        <p className="text-[10px] text-gray-500 mb-2">✨ Suggested tags:</p>
                        <div className="flex flex-wrap gap-1">
                            {suggestedTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAddTag?.(item.id, tag)
                                        setSuggestedTags(prev => prev.filter(t => t !== tag))
                                    }}
                                    className="text-[10px] px-2 py-0.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded text-primary-300 transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
})
