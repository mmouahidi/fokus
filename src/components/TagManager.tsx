import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Edit2, Trash2, Check } from 'lucide-react'
import { useStore } from '@/lib/store'

interface TagManagerProps {
    isOpen: boolean
    onClose: () => void
}

export default function TagManager({ isOpen, onClose }: TagManagerProps) {
    const { getAllTags, renameTag, deleteTag } = useStore()
    const [editingTag, setEditingTag] = useState<string | null>(null)
    const [newName, setNewName] = useState('')

    const tags = getAllTags()

    const handleStartEdit = (tag: string) => {
        setEditingTag(tag)
        setNewName(tag)
    }

    const handleSaveEdit = () => {
        if (editingTag && newName && newName !== editingTag) {
            renameTag(editingTag, newName)
        }
        setEditingTag(null)
        setNewName('')
    }

    const handleDelete = (tag: string) => {
        if (confirm(`Delete tag "${tag}"? This will remove it from all items.`)) {
            deleteTag(tag)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <Tag className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Tag Manager</h2>
                                    <p className="text-sm text-gray-400">{tags.length} tags total</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
                            {tags.length > 0 ? (
                                tags.map(({ tag, count }) => (
                                    <div
                                        key={tag}
                                        className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        {editingTag === tag ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveEdit()
                                                        if (e.key === 'Escape') setEditingTag(null)
                                                    }}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="p-1.5 bg-primary-500 hover:bg-primary-600 rounded transition-colors"
                                                >
                                                    <Check className="w-4 h-4 text-white" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingTag(null)}
                                                    className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-300" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">#{tag}</span>
                                                    <span className="text-xs text-gray-500">({count} items)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleStartEdit(tag)}
                                                        className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                                                        title="Rename tag"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(tag)}
                                                        className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                                        title="Delete tag"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Tag className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No tags yet</p>
                                    <p className="text-xs text-gray-600 mt-1">Add tags to items to see them here</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-gray-900/50">
                            <p className="text-xs text-gray-500 text-center">
                                Rename or delete tags to update all items at once
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
