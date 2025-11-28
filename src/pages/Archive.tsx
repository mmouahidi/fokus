import { useState } from 'react'
import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Archive as ArchiveIcon, Trash2, RefreshCw, Search, X } from 'lucide-react'

export default function Archive() {
    const { getArchivedItems, unarchiveItem, removeItem } = useStore()
    const [searchQuery, setSearchQuery] = useState('')

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
                            className="p-4 bg-gray-800/50 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
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

                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleRestore(item.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg text-xs text-primary-300 transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handlePermanentDelete(item.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
