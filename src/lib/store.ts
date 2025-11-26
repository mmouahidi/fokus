import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CardItem } from '@/components/CardStack'
import { notificationService } from './notifications'

export interface CaptureItem {
    id: string
    content: string
    timestamp: number
    processed: boolean
    processedAt?: number
    processedId?: string
    error?: string
    retryCount?: number
}

export interface AppSettings {
    aiMode: 'mock' | 'real'
    aiModel: 'gpt-4o' | 'gpt-4o-mini'
    model: 'gpt-4o' | 'gpt-4o-mini' // Keep for backwards compatibility
    soundEnabled: boolean
    notificationsEnabled: boolean
    animationSpeed: 'slow' | 'normal' | 'fast'
    dailyReminderEnabled: boolean
    dailyReminderTime: string // HH:MM format
    silentHoursEnabled: boolean
    silentHoursStart: string // HH:MM format
    silentHoursEnd: string // HH:MM format
}

export interface AIError {
    id: string
    captureId: string
    error: string
    timestamp: number
}

export interface AppStats {
    itemsCompleted: number
    streak: number
    lastActive: number
    completionHistory: Record<string, number> // date (YYYY-MM-DD) -> count
}

interface AppState {
    captures: CaptureItem[]
    items: CardItem[]
    isProcessing: boolean
    settings: AppSettings
    aiErrors: AIError[]
    stats: AppStats

    // Actions
    addCapture: (content: string) => void
    removeCapture: (id: string) => void
    updateCapture: (id: string, updates: Partial<CaptureItem>) => void
    setProcessing: (isProcessing: boolean) => void
    addItem: (item: CardItem) => void
    addItems: (items: CardItem[]) => void
    removeItem: (id: string) => void
    updateItem: (id: string, updates: Partial<CardItem>) => void

    // Settings
    updateSettings: (settings: Partial<AppSettings>) => void

    // Error handling
    addError: (captureId: string, error: string) => void
    clearErrors: () => void

    // Data management
    clearAllItems: () => void
    clearAllCaptures: () => void
    exportData: () => string
    importData: (jsonData: string) => void

    // Selectors/Helpers
    getUnprocessedCaptures: () => CaptureItem[]

    // Tag Management
    getAllTags: () => { tag: string; count: number }[]
    renameTag: (oldName: string, newName: string) => void
    deleteTag: (tagName: string) => void

    // Bulk Operations
    removeItems: (ids: string[]) => void
    updateItems: (ids: string[], updates: Partial<CardItem>) => void

    // Gamification
    incrementStats: () => void

    // Kanban Board
    moveItemToColumn: (id: string, column: 'now' | 'soon' | 'later' | 'someday') => void
    getItemsByColumn: (column: 'now' | 'soon' | 'later' | 'someday') => CardItem[]
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            captures: [],
            items: [],
            isProcessing: false,
            settings: {
                aiMode: 'real',
                aiModel: 'gpt-4o',
                model: 'gpt-4o',
                soundEnabled: true,
                notificationsEnabled: false,
                animationSpeed: 'normal',
                dailyReminderEnabled: false,
                dailyReminderTime: '09:00',
                silentHoursEnabled: false,
                silentHoursStart: '22:00',
                silentHoursEnd: '07:00'
            },
            aiErrors: [],
            stats: {
                itemsCompleted: 0,
                streak: 0,
                lastActive: 0,
                completionHistory: {}
            },

            addCapture: (content: string) => {
                const newCapture: CaptureItem = {
                    id: crypto.randomUUID(),
                    content,
                    timestamp: Date.now(),
                    processed: false,
                    retryCount: 0
                }
                set((state) => ({ captures: [newCapture, ...state.captures] }))
            },

            removeCapture: (id: string) => {
                set((state) => ({
                    captures: state.captures.filter((c) => c.id !== id)
                }))
            },

            updateCapture: (id: string, updates: Partial<CaptureItem>) => {
                set((state) => ({
                    captures: state.captures.map((c) => {
                        if (c.id !== id) return c

                        // If marking as processed and it wasn't before, set processedAt
                        if (updates.processed && !c.processed) {
                            return { ...c, ...updates, processedAt: Date.now() }
                        }

                        return { ...c, ...updates }
                    })
                }))
            },

            setProcessing: (isProcessing: boolean) => set({ isProcessing }),

            addItem: (item: CardItem) => {
                set((state) => ({ items: [item, ...state.items] }))
            },

            addItems: (newItems: CardItem[]) => {
                set((state) => ({ items: [...newItems, ...state.items] }))
            },

            removeItem: (id: string) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id)
                }))
            },

            updateItem: (id: string, updates: Partial<CardItem>) => {
                set((state) => ({
                    items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i))
                }))
            },

            updateSettings: (newSettings: Partial<AppSettings>) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings }
                }))
            },

            addError: (captureId: string, error: string) => {
                const newError: AIError = {
                    id: crypto.randomUUID(),
                    captureId,
                    error,
                    timestamp: Date.now()
                }
                set((state) => ({
                    aiErrors: [newError, ...state.aiErrors].slice(0, 10)
                }))
            },

            clearErrors: () => set({ aiErrors: [] }),

            clearAllItems: () => set({ items: [] }),

            clearAllCaptures: () => set({ captures: [] }),

            exportData: () => {
                const state = get()
                return JSON.stringify({
                    items: state.items,
                    captures: state.captures,
                    settings: state.settings,
                    stats: state.stats,
                    exportedAt: new Date().toISOString()
                }, null, 2)
            },

            importData: (jsonData: string) => {
                try {
                    const data = JSON.parse(jsonData)
                    set((state) => ({
                        items: data.items || [],
                        captures: data.captures || [],
                        settings: data.settings || state.settings,
                        stats: data.stats || state.stats
                    }))
                } catch (error) {
                    console.error('Failed to import data:', error)
                }
            },

            getUnprocessedCaptures: () => {
                return get().captures.filter((c) => !c.processed)
            },

            // Tag Management Methods
            getAllTags: () => {
                const { items } = get()
                const tagCounts: Record<string, number> = {}

                items.forEach(item => {
                    item.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1
                    })
                })

                return Object.entries(tagCounts)
                    .map(([tag, count]) => ({ tag, count }))
                    .sort((a, b) => b.count - a.count)
            },

            renameTag: (oldName: string, newName: string) => {
                set((state) => ({
                    items: state.items.map(item => ({
                        ...item,
                        tags: item.tags.map(tag => tag === oldName ? newName : tag)
                    }))
                }))
            },

            deleteTag: (tagName: string) => {
                set((state) => ({
                    items: state.items.map(item => ({
                        ...item,
                        tags: item.tags.filter(tag => tag !== tagName)
                    }))
                }))
            },

            // Bulk Operations Methods
            removeItems: (ids: string[]) => {
                set((state) => ({
                    items: state.items.filter(item => !ids.includes(item.id))
                }))
            },

            updateItems: (ids: string[], updates: Partial<CardItem>) => {
                set((state) => ({
                    items: state.items.map(item =>
                        ids.includes(item.id) ? { ...item, ...updates } : item
                    )
                }))
            },

            incrementStats: () => {
                set((state) => {
                    const now = Date.now()
                    const lastActive = new Date(state.stats.lastActive)
                    const today = new Date(now)

                    const isSameDay = lastActive.getDate() === today.getDate() &&
                        lastActive.getMonth() === today.getMonth() &&
                        lastActive.getFullYear() === today.getFullYear()

                    const isNextDay = (today.getTime() - lastActive.getTime()) < (48 * 60 * 60 * 1000) && !isSameDay

                    let newStreak = state.stats.streak
                    if (isNextDay) newStreak += 1
                    else if (!isSameDay && !isNextDay && state.stats.lastActive > 0) newStreak = 1
                    else if (state.stats.streak === 0) newStreak = 1

                    const newItemsCompleted = state.stats.itemsCompleted + 1

                    // Update completion history
                    const dateKey = today.toISOString().split('T')[0]
                    const currentDailyCount = state.stats.completionHistory?.[dateKey] || 0
                    const newCompletionHistory = {
                        ...(state.stats.completionHistory || {}),
                        [dateKey]: currentDailyCount + 1
                    }

                    // Send notifications if enabled
                    if (state.settings.notificationsEnabled) {
                        const silentConfig = {
                            enabled: state.settings.silentHoursEnabled,
                            start: state.settings.silentHoursStart,
                            end: state.settings.silentHoursEnd
                        }

                        // Milestone notifications
                        notificationService.notifyMilestoneReached(newItemsCompleted, silentConfig)

                        // Streak milestone notifications
                        notificationService.notifyStreakMilestone(newStreak, silentConfig)
                    }

                    return {
                        stats: {
                            ...state.stats,
                            itemsCompleted: newItemsCompleted,
                            streak: newStreak,
                            lastActive: now,
                            completionHistory: newCompletionHistory
                        }
                    }
                })
            },

            // Kanban Board Methods
            moveItemToColumn: (id: string, column: 'now' | 'soon' | 'later' | 'someday') => {
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, kanbanColumn: column } : item
                    )
                }))
            },

            getItemsByColumn: (column: 'now' | 'soon' | 'later' | 'someday') => {
                return get().items.filter(item => item.kanbanColumn === column)
            }
        }),
        {
            name: 'fokus-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                captures: state.captures,
                items: state.items,
                settings: state.settings,
                stats: state.stats
            }),
        }
    )
)
