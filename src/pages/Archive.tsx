import { useState } from 'react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Archive as ArchiveIcon, Trash2, RefreshCw, Search, X, CheckSquare, Copy, Check } from 'lucide-react'

export default function Archive() {
    const { getArchivedItems, unarchiveItem, removeItem, removeItems } = useStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (item: import('@/components/CardStack').CardItem, e: React.MouseEvent) => {
        e.stopPropagation()
        const textToCopy = [
            `Title: ${item.title}`,
            `Summary: ${item.summary}`,
            item.url ? `URL: ${item.url}` : '',
            item.notes ? `\nNotes:\n${item.notes}` : ''
        ].filter(Boolean).join('\n')

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(item.id)
            setTimeout(() => setCopiedId(null), 2000)
        })
    }

    const archivedItems = getArchivedItems().filter(item => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            item.title.toLowerCase().includes(query) ||
            item.summary.toLowerCase().includes(query) ||
            item.notes?.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        )
    })

    const handleRestore = (id: string) => {
        unarchiveItem(id)
    }

    const handlePermanentDelete = (id: string) => {
        if (confirm('Permanently delete this item? This cannot be undone.')) {
            removeItem(id)
        }
    }

    const handleBulkDelete = () => {
        if (selectedIds.length > 0 && confirm(`Permanently delete ${selectedIds.length} items? This cannot be undone.`)) {
            removeItems(selectedIds)
            setSelectedIds([])
            setSelectMode(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ArchiveIcon className="w-8 h-8 text-gray-400" />
                    <h1 className="text-3xl font-bold text-white">Archive</h1>
                </div>
                <p className="text-gray-400 mb-6">
                    {archivedItems.length} archived item{archivedItems.length !== 1 ? 's' : ''}
                    {searchQuery && ' found'}
                </p>

                <div className="w-full max-w-md mt-4 flex items-center gap-2 mb-4">
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
                    {!selectMode && archivedItems.length > 0 && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to permanently delete all archived items? This cannot be undone.')) {
                                    removeItems(archivedItems.map(item => item.id))
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors ml-auto"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
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

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search archive..."
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

            {archivedItems.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                    <ArchiveIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">
                        {searchQuery ? 'No items match your search' : 'No archived items'}
                    </p>
                    {!searchQuery && (
                        <p className="text-xs text-gray-600 mt-2">
                            Completed items will appear here
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {archivedItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => {
                                if (selectMode) {
                                    setSelectedIds(prev =>
                                        prev.includes(item.id)
                                            ? prev.filter(id => id !== item.id)
                                            : [...prev, item.id]
                                    )
                                }
                            }}
                            className={`p-4 rounded-xl border transition-colors ${
                                selectMode ? 'cursor-pointer' : ''
                            } ${
                                selectedIds.includes(item.id)
                                    ? 'bg-primary-500/20 border-primary-500/50'
                                    : 'bg-gray-800/50 border-white/10 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                {selectMode && (
                                    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border ${
                                        selectedIds.includes(item.id)
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'border-gray-500'
                                    }`}>
                                        {selectedIds.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1">
                                            <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'video' ? 'bg-red-500/20 text-red-300' :
                                                item.type === 'article' ? 'bg-blue-500/20 text-blue-300' :
                                                    item.type === 'task' ? 'bg-emerald-500/20 text-emerald-300' :
                                                        'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.type === 'task'
                                                    ? 'border-emerald-500/30 text-emerald-400'
                                                    : 'border-blue-500/30 text-blue-400'
                                                }`}>
                                                {item.type === 'task' ? 'ACT' : 'REF'}
                                            </span>
                                        </div>
                                        {item.archivedAt && (
                                            <span className="text-xs text-gray-500">
                                                Archived {new Date(item.archivedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{item.summary}</p>

                                    {item.notes && (
                                        <div className="mt-2 p-2 bg-gray-900/50 rounded border border-white/5">
                                            <p className="text-xs text-gray-500 mb-1">📝 Notes:</p>
                                            <p className="text-sm text-gray-300">{item.notes}</p>
                                        </div>
                                    )}

                                    {item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {!selectMode && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={(e) => handleCopy(item, e)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
                                    >
                                        {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        Copy
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRestore(item.id); }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg text-xs text-primary-300 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Restore
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePermanentDelete(item.id); }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
