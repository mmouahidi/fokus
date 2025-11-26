import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Tag, Link as LinkIcon } from 'lucide-react'
import type { CardItem } from './CardStack'

interface EditItemModalProps {
    item: CardItem
    isOpen: boolean
    onClose: () => void
    onSave: (updatedItem: Partial<CardItem>) => void
}

export default function EditItemModal({ item, isOpen, onClose, onSave }: EditItemModalProps) {
    const [title, setTitle] = useState(item.title)
    const [summary, setSummary] = useState(item.summary)
    const [url, setUrl] = useState(item.url || '')
    const [type, setType] = useState(item.type)
    const [timeEstimate, setTimeEstimate] = useState(item.timeEstimate || '')
    const [tagsInput, setTagsInput] = useState(item.tags.join(', '))

    const handleSave = () => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        onSave({
            title,
            summary,
            url: url || undefined,
            type,
            timeEstimate: timeEstimate || undefined,
            tags
        })
        onClose()
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
                        className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Edit Item</h2>
                                <p className="text-sm text-gray-400 mt-1">Update item details</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter title..."
                                />
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Summary</label>
                                <textarea
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows={4}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    placeholder="Enter summary..."
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as CardItem['type'])}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="task">Task</option>
                                    <option value="article">Article</option>
                                    <option value="video">Video</option>
                                    <option value="idea">Idea</option>
                                </select>
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <LinkIcon className="w-4 h-4 inline mr-1" />
                                    URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            {/* Time Estimate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Time Estimate (optional)</label>
                                <input
                                    type="text"
                                    value={timeEstimate}
                                    onChange={(e) => setTimeEstimate(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="e.g., 5 min, 1 hour, Quick task"
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Tag className="w-4 h-4 inline mr-1" />
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="work, urgent, reading"
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-2 text-white font-medium"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
