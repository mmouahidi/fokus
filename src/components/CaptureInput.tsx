import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CaptureInputProps {
    initialValue?: string
    onSubmit?: (value: string) => void
    placeholder?: string
    className?: string
}

export default function CaptureInput({
    initialValue = '',
    onSubmit,
    placeholder = "What's on your mind?",
    className
}: CaptureInputProps) {
    const [value, setValue] = useState(initialValue)
    const [isFocused, setIsFocused] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [])

    useEffect(() => {
        if (initialValue) {
            setTimeout(() => {
                setValue(initialValue)
                adjustHeight()
            }, 0)
        }
    }, [initialValue, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
        adjustHeight()
    }

    const handleSubmit = () => {
        if (!value.trim()) return

        if (onSubmit) {
            onSubmit(value)
        } else {
            console.log('Captured:', value)
        }

        // Success animation
        setIsSuccess(true)
        setValue('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }

        setTimeout(() => {
            setIsSuccess(false)
        }, 2000)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className={cn("relative w-full max-w-md mx-auto", className)}>
            <motion.div
                layout
                className={cn(
                    "relative bg-gray-900/50 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300",
                    isFocused ? "border-primary-500/50 shadow-lg shadow-primary-500/10" : "border-white/10",
                    isSuccess ? "border-green-500/50" : ""
                )}
            >
                <div className="relative flex items-start p-4">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        rows={1}
                        className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg leading-relaxed max-h-[200px]"
                    />

                    <AnimatePresence>
                        {(value.trim() || isFocused) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSubmit}
                                className={cn(
                                    "ml-2 p-2 rounded-full transition-colors",
                                    value.trim()
                                        ? "bg-primary-500 text-white hover:bg-primary-600"
                                        : "bg-gray-800 text-gray-500"
                                )}
                            >
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-green-500 bg-white rounded-full p-0.5"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </motion.div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Helper text */}
                <AnimatePresence>
                    {isFocused && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-3 text-xs text-gray-500 flex justify-between items-center border-t border-white/5 pt-2"
                        >
                            <span>Shift + Enter for new line</span>
                            <span>Enter to capture</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Success Toast */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-12 left-0 right-0 text-center"
                    >
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                            Captured successfully!
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
