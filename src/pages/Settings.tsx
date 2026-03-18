import { useState } from 'react'
import { Settings as SettingsIcon, Download, Sparkles, Bell, Palette, Zap, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { autoImport, importFromPlainText, importFromCSV, importFromJSON, importFromMarkdown, type ImportResult } from '@/lib/importers'
import { notificationService } from '@/lib/notifications'

export default function Settings() {
    const {
        settings,
        updateSettings,
        items,
        stats,
        addItems
    } = useStore()

    const [showImportModal, setShowImportModal] = useState(false)
    const [importText, setImportText] = useState('')
    const [importFormat, setImportFormat] = useState<'auto' | 'plain' | 'csv' | 'json' | 'markdown'>('auto')
    const [importResult, setImportResult] = useState<ImportResult | null>(null)









    const handlePreviewImport = () => {
        if (!importText.trim()) return

        let result: ImportResult
        switch (importFormat) {
            case 'plain':
                result = importFromPlainText(importText)
                break
            case 'csv':
                result = importFromCSV(importText)
                break
            case 'json':
                result = importFromJSON(importText)
                break
            case 'markdown':
                result = importFromMarkdown(importText)
                break
            default:
                result = autoImport(importText)
        }

        setImportResult(result)
    }

    const handleConfirmImport = () => {
        if (!importResult || !importResult.success) return

        addItems(importResult.items)
        setShowImportModal(false)
        setImportText('')
        setImportResult(null)
        alert(`Successfully imported ${importResult.items.length} tasks!`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary-500/20 rounded-xl">
                        <SettingsIcon className="w-8 h-8 text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-gray-400">Customize your FOKUS experience</p>
                    </div>
                </div>

                {/* AI Settings Section - Embedded */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-primary-400" />
                        <h2 className="text-xl font-semibold">AI Settings</h2>
                    </div>

                    <div className="bg-gray-900/50 border border-white/5 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-white">AI Processor</h3>
                                <p className="text-xs text-gray-400">Powered by Google Gemini</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-medium text-green-400">Active</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Model Selection
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => updateSettings({ model: 'gemini-1.5-flash' })}
                                    className={`p-3 rounded-lg border text-left transition-all ${settings.model === 'gemini-1.5-flash'
                                        ? 'bg-primary-500/20 border-primary-500/50 text-white'
                                        : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="font-medium text-sm">Gemini 1.5 Flash</div>
                                    <div className="text-[10px] opacity-70">Fast & Efficient</div>
                                </button>
                                <button
                                    onClick={() => updateSettings({ model: 'gemini-1.5-pro' })}
                                    className={`p-3 rounded-lg border text-left transition-all ${settings.model === 'gemini-1.5-pro'
                                        ? 'bg-primary-500/20 border-primary-500/50 text-white'
                                        : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="font-medium text-sm">Gemini 1.5 Pro</div>
                                    <div className="text-[10px] opacity-70">Complex Reasoning</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold">Notifications</h2>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Sound Effects</p>
                                <p className="text-sm text-gray-400">Play sounds on actions</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                                className={`relative w-16 h-8 rounded-full transition-colors ${settings.soundEnabled ? 'bg-primary-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-8' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Browser Notifications</p>
                                <p className="text-sm text-gray-400">Get notified when tasks are completed</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!settings.notificationsEnabled) {
                                        Notification.requestPermission().then(permission => {
                                            if (permission === 'granted') {
                                                updateSettings({ notificationsEnabled: true })
                                                new Notification('Notifications Enabled', {
                                                    body: 'You will now receive notifications from FOKUS',
                                                    icon: '/icon.svg'
                                                })
                                            } else {
                                                alert('Permission denied. Please enable notifications in your browser settings.')
                                            }
                                        })
                                    } else {
                                        updateSettings({ notificationsEnabled: false })
                                    }
                                }}
                                className={`relative w-16 h-8 rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-primary-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-8' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Daily Reminder */}
                        {settings.notificationsEnabled && (
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-medium">Daily Reminder</p>
                                        <p className="text-sm text-gray-400">Get a reminder to review your tasks</p>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ dailyReminderEnabled: !settings.dailyReminderEnabled })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.dailyReminderEnabled ? 'bg-primary-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.dailyReminderEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {settings.dailyReminderEnabled && (
                                    <div className="flex items-center gap-4 ml-4">
                                        <label className="text-sm text-gray-400">Time:</label>
                                        <input
                                            type="time"
                                            value={settings.dailyReminderTime}
                                            onChange={(e) => updateSettings({ dailyReminderTime: e.target.value })}
                                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Silent Hours */}
                        {settings.notificationsEnabled && (
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-medium">Silent Hours</p>
                                        <p className="text-sm text-gray-400">Mute notifications during specific times</p>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ silentHoursEnabled: !settings.silentHoursEnabled })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.silentHoursEnabled ? 'bg-primary-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.silentHoursEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {settings.silentHoursEnabled && (
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-400">Start:</label>
                                            <input
                                                type="time"
                                                value={settings.silentHoursStart}
                                                onChange={(e) => updateSettings({ silentHoursStart: e.target.value })}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-400">End:</label>
                                            <input
                                                type="time"
                                                value={settings.silentHoursEnd}
                                                onChange={(e) => updateSettings({ silentHoursEnd: e.target.value })}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Test Notification */}
                        {settings.notificationsEnabled && (
                            <div className="pt-4 border-t border-white/5">
                                <button
                                    onClick={() => notificationService.sendTestNotification()}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors w-full"
                                >
                                    Send Test Notification
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Theme Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette className="w-5 h-5 text-pink-400" />
                        <h2 className="text-xl font-semibold">Theme</h2>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-white/5">
                        <div>
                            <p className="font-medium mb-2">Animation Speed</p>
                            <select
                                value={settings.animationSpeed}
                                onChange={(e) => updateSettings({ animationSpeed: e.target.value as 'slow' | 'normal' | 'fast' })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="slow">Slow</option>
                                <option value="normal">Normal</option>
                                <option value="fast">Fast</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Statistics Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-xl font-semibold">Your Stats</h2>
                    </div>

                    <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-xl p-6 border border-primary-500/30">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary-400">{stats.itemsCompleted}</div>
                                <div className="text-sm text-gray-400">Items Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-400">{stats.streak}</div>
                                <div className="text-sm text-gray-400">Day Streak 🔥</div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                Last active: {stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'Never'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Export Integrations Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-xl font-semibold">Export to Second Brain</h2>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 border border-white/5">
                        <p className="text-sm text-gray-400 mb-4">
                            Export your archived knowledge to your favorite tools.
                        </p>

                        <div className="grid gap-3">
                            <button
                                onClick={() => {
                                    const archivedItems = items.filter(i => i.archived)
                                    if (archivedItems.length === 0) {
                                        alert('No archived items to export!')
                                        return
                                    }
                                    import('@/lib/exporters').then(({ exportToMarkdown, downloadFile }) => {
                                        const content = exportToMarkdown(archivedItems)
                                        downloadFile(content, `fokus-obsidian-export-${Date.now()}.md`, 'text/markdown')
                                    })
                                }}
                                className="flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-purple-500/30 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:text-purple-300">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-purple-100">Obsidian / Markdown</p>
                                        <p className="text-xs text-gray-400">Single file with formatted notes</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                            </button>

                            <button
                                onClick={() => {
                                    const archivedItems = items.filter(i => i.archived)
                                    if (archivedItems.length === 0) {
                                        alert('No archived items to export!')
                                        return
                                    }
                                    import('@/lib/exporters').then(({ exportToCSV, downloadFile }) => {
                                        const content = exportToCSV(archivedItems)
                                        downloadFile(content, `fokus-notion-export-${Date.now()}.csv`, 'text/csv')
                                    })
                                }}
                                className="flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-blue-500/30 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-blue-100">Notion / CSV</p>
                                        <p className="text-xs text-gray-400">Table format with properties</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                            </button>

                            <button
                                onClick={() => {
                                    const archivedItems = items.filter(i => i.archived)
                                    if (archivedItems.length === 0) {
                                        alert('No archived items to export!')
                                        return
                                    }
                                    import('@/lib/exporters').then(({ exportToJSON, downloadFile }) => {
                                        const content = exportToJSON(archivedItems)
                                        downloadFile(content, `fokus-json-export-${Date.now()}.json`, 'application/json')
                                    })
                                }}
                                className="flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-yellow-500/30 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400 group-hover:text-yellow-300">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-yellow-100">JSON (Raw)</p>
                                        <p className="text-xs text-gray-400">Raw data for developers</p>
                                    </div>
                                </div>
                                <Download className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="w-full max-w-3xl bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Import Tasks</h2>
                                        <p className="text-sm text-gray-400">Paste your tasks in any format</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                {/* Format Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Import Format</label>
                                    <select
                                        value={importFormat}
                                        onChange={(e) => setImportFormat(e.target.value as 'auto' | 'plain' | 'csv' | 'json' | 'markdown')}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="auto">Auto-detect</option>
                                        <option value="plain">Plain Text (one per line)</option>
                                        <option value="csv">CSV (title,description,tags,time)</option>
                                        <option value="json">JSON Array</option>
                                        <option value="markdown">Markdown Checklist</option>
                                    </select>
                                </div>

                                {/* Text Input */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Paste Tasks</label>
                                    <textarea
                                        value={importText}
                                        onChange={(e) => setImportText(e.target.value)}
                                        placeholder={
                                            importFormat === 'plain' ? "Buy milk\nFinish report\nCall dentist" :
                                                importFormat === 'csv' ? "title,description,tags,time\nBuy milk,Get groceries,shopping,5 min" :
                                                    importFormat === 'json' ? '[{"title": "Buy milk", "tags": ["shopping"]}]' :
                                                        importFormat === 'markdown' ? "- [ ] Buy milk\n- [ ] Finish report" :
                                                            "Paste your tasks here..."
                                        }
                                        className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
                                    />
                                </div>

                                {/* Preview Button */}
                                <button
                                    onClick={handlePreviewImport}
                                    disabled={!importText.trim()}
                                    className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    Preview Import
                                </button>

                                {/* Import Result */}
                                {importResult && (
                                    <div className={`p-4 rounded-lg border ${importResult.success
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {importResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            )}
                                            <span className="font-semibold">
                                                {importResult.success
                                                    ? `Found ${importResult.items.length} tasks`
                                                    : 'Import failed'}
                                            </span>
                                        </div>

                                        {importResult.errors.length > 0 && (
                                            <div className="mt-2 text-sm text-red-300">
                                                <p className="font-medium mb-1">Errors:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {importResult.errors.slice(0, 5).map((error, i) => (
                                                        <li key={i}>{error}</li>
                                                    ))}
                                                    {importResult.errors.length > 5 && (
                                                        <li>...and {importResult.errors.length - 5} more</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        {importResult.success && importResult.items.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-sm font-medium text-gray-300">Preview:</p>
                                                <div className="max-h-40 overflow-y-auto space-y-1">
                                                    {importResult.items.slice(0, 10).map((item, i) => (
                                                        <div key={i} className="text-sm bg-gray-800/50 rounded px-3 py-2">
                                                            <span className="font-medium">{item.title}</span>
                                                            <span className="text-gray-500 ml-2">
                                                                {item.tags.join(', ')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {importResult.items.length > 10 && (
                                                        <p className="text-xs text-gray-500 px-3">
                                                            ...and {importResult.items.length - 10} more
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/5 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={!importResult?.success}
                                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    Import {importResult?.items.length || 0} Tasks
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
