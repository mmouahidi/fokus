import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Handle standard install prompt (Android/Desktop)
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Handle iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches

        if (isIOSDevice && !isStandalone) {
            setIsIOS(true)
            // Delay showing prompt on iOS to not be annoying immediately
            setTimeout(() => setShowPrompt(true), 3000)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setShowPrompt(false)
        }
    }

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:w-80"
                >
                    <div className="bg-gray-900/90 backdrop-blur-xl border border-primary-500/30 p-4 rounded-2xl shadow-2xl flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-500/20 rounded-xl">
                                <Download className="w-6 h-6 text-primary-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm">Install App</h3>
                                <p className="text-xs text-gray-400">Add to home screen for better experience</p>
                            </div>
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors self-start"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="text-xs text-gray-300 space-y-2 pl-2 border-l-2 border-primary-500/30">
                                <p>1. Tap the <Share className="w-3 h-3 inline mx-1" /> Share button</p>
                                <p>2. Scroll down and tap "Add to Home Screen"</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstall}
                                className="w-full py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-xs font-bold text-white transition-colors"
                            >
                                Install
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
