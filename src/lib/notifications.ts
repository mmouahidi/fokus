// Notification Service for FOKUS
// Handles all browser notifications with scheduling and preferences

export type NotificationType =
    | 'task_completed'
    | 'milestone_reached'
    | 'daily_reminder'
    | 'processing_complete'
    | 'streak_milestone'

export interface NotificationOptions {
    title: string
    body: string
    icon?: string
    tag?: string
    data?: any
}

class NotificationService {
    private dailyReminderInterval: number | null = null

    /**
     * Check if notifications are supported in this browser
     */
    isSupported(): boolean {
        return 'Notification' in window
    }

    /**
     * Get current notification permission status
     */
    getPermission(): NotificationPermission {
        if (!this.isSupported()) return 'denied'
        return Notification.permission
    }

    /**
     * Request notification permission from user
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!this.isSupported()) {
            console.warn('Notifications not supported in this browser')
            return 'denied'
        }

        if (Notification.permission === 'granted') {
            return 'granted'
        }

        const permission = await Notification.requestPermission()

        if (permission === 'granted') {
            this.sendNotification('task_completed', {
                title: '🎉 Notifications Enabled!',
                body: 'You\'ll now receive updates from FOKUS',
            })
        }

        return permission
    }

    /**
     * Check if notifications should be sent based on silent hours
     */
    private isInSilentHours(silentHoursEnabled: boolean, startTime: string, endTime: string): boolean {
        if (!silentHoursEnabled) return false

        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTime = currentHour * 60 + currentMinute

        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)
        const start = startHour * 60 + startMinute
        const end = endHour * 60 + endMinute

        // Handle overnight silent hours (e.g., 22:00 - 07:00)
        if (start > end) {
            return currentTime >= start || currentTime < end
        }

        return currentTime >= start && currentTime < end
    }

    /**
     * Send a notification
     */
    sendNotification(
        type: NotificationType,
        options: NotificationOptions,
        silentHoursConfig?: { enabled: boolean; start: string; end: string }
    ): void {
        if (!this.isSupported() || Notification.permission !== 'granted') {
            return
        }

        // Check silent hours
        if (silentHoursConfig && this.isInSilentHours(
            silentHoursConfig.enabled,
            silentHoursConfig.start,
            silentHoursConfig.end
        )) {
            console.log('Notification suppressed due to silent hours:', options.title)
            return
        }

        const notification = new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/icon.svg',
            tag: options.tag || type,
            badge: '/icon.svg',
            data: { type, ...options.data },
            requireInteraction: type === 'milestone_reached' || type === 'streak_milestone',
        })

        // Auto-close after 5 seconds for non-important notifications
        if (type !== 'milestone_reached' && type !== 'streak_milestone') {
            setTimeout(() => notification.close(), 5000)
        }

        // Handle notification click
        notification.onclick = () => {
            window.focus()
            notification.close()

            // Navigate based on notification type
            if (type === 'daily_reminder') {
                window.location.hash = '#/review'
            }
        }
    }

    /**
     * Send task completion notification
     */
    notifyTaskCompleted(taskTitle: string, config?: any): void {
        this.sendNotification('task_completed', {
            title: '✅ Task Completed!',
            body: taskTitle,
            tag: 'task-complete',
        }, config)
    }

    /**
     * Send milestone notification
     */
    notifyMilestoneReached(count: number, config?: any): void {
        const milestones = [10, 25, 50, 100, 250, 500, 1000]
        const isMilestone = milestones.includes(count)

        if (isMilestone) {
            this.sendNotification('milestone_reached', {
                title: '🎉 Milestone Reached!',
                body: `You've completed ${count} items! Amazing progress!`,
                tag: `milestone-${count}`,
            }, config)
        }
    }

    /**
     * Send streak milestone notification
     */
    notifyStreakMilestone(streakDays: number, config?: any): void {
        const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365]
        const isMilestone = streakMilestones.includes(streakDays)

        if (isMilestone) {
            this.sendNotification('streak_milestone', {
                title: '🔥 Epic Streak!',
                body: `${streakDays} days in a row! You're unstoppable!`,
                tag: `streak-${streakDays}`,
            }, config)
        }
    }

    /**
     * Send processing complete notification
     */
    notifyProcessingComplete(itemsProcessed: number, config?: any): void {
        if (itemsProcessed > 0) {
            this.sendNotification('processing_complete', {
                title: '🤖 AI Processing Complete',
                body: `Successfully processed ${itemsProcessed} ${itemsProcessed === 1 ? 'item' : 'items'}`,
                tag: 'processing-complete',
            }, config)
        }
    }

    /**
     * Send daily review reminder
     */
    sendDailyReminder(pendingItems: number, config?: any): void {
        this.sendNotification('daily_reminder', {
            title: '📝 Time to Review',
            body: `You have ${pendingItems} items waiting for review`,
            tag: 'daily-reminder',
        }, config)
    }

    /**
     * Schedule daily reminder at specific time
     */
    scheduleDailyReminder(time: string, getPendingCount: () => number, config?: any): void {
        // Clear existing interval
        if (this.dailyReminderInterval) {
            clearInterval(this.dailyReminderInterval)
        }

        const [hours, minutes] = time.split(':').map(Number)

        // Check every minute if it's time to send reminder
        this.dailyReminderInterval = window.setInterval(() => {
            const now = new Date()
            if (now.getHours() === hours && now.getMinutes() === minutes) {
                const pending = getPendingCount()
                if (pending > 0) {
                    this.sendDailyReminder(pending, config)
                }
            }
        }, 60000) // Check every minute
    }

    /**
     * Cancel scheduled daily reminder
     */
    cancelDailyReminder(): void {
        if (this.dailyReminderInterval) {
            clearInterval(this.dailyReminderInterval)
            this.dailyReminderInterval = null
        }
    }

    /**
     * Test notification (for settings page)
     */
    sendTestNotification(): void {
        this.sendNotification('task_completed', {
            title: '🔔 Test Notification',
            body: 'This is how notifications will appear',
            tag: 'test',
        })
    }
}

// Export singleton instance
export const notificationService = new NotificationService()
