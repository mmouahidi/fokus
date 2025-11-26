import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'

export default function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false)

    const shortcuts = [
        { key: 'Space', action: 'Execute current item', page: 'Review' },
        { key: 'Delete / Backspace', action: 'Delete current item', page: 'Review' },
        { key: 'Arrow Up', action: 'Save for later', page: 'Review' },
        { key: 'Escape', action: 'Close modals / dialogs', page: 'All' },
        { key: 'Enter', action: 'Submit capture', page: 'Home' },
    ]

    return (
        <>
            {/* Floating Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 p-3 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-full shadow-lg transition-all z-40"
                title="Keyboard Shortcuts"
            >
                <Keyboard className="w-5 h-5 text-gray-300" />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
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
                                        <Keyboard className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                                        <p className="text-sm text-gray-400">Speed up your workflow</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                                {shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{shortcut.action}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{shortcut.page}</p>
                                        </div>
                                        <kbd className="px-3 py-1.5 bg-gray-700 border border-white/10 rounded-lg text-xs font-mono text-gray-300">
                                            {shortcut.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-white/5 bg-gray-900/50">
                                <p className="text-xs text-gray-500 text-center">
                                    Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Esc</kbd> to close
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
