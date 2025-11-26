// lib/sounds.ts - Sound effects for the app

const sounds = {
    capture: () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTAoOUKfk77RgGwU7k9jyz3YpBSV7y/DchUELFGGy6+eoVRQKRp/g8r5sIQUrgc7y2Yk2CBlouvDknEwKDlCn5O+0YBsF')
        audio.volume = 0.3
        audio.play().catch(() => { })
    },

    swipeRight: () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTAoOUKfk77RgGwU7k9jyz3YpBSV7y/DchUELFGGy6+eoVRQKRp/g8r5sIQUrgc7y2Yk2CBlouvDknEwKDlCn5O+0YBsF')
        audio.volume = 0.4
        audio.playbackRate = 1.2
        audio.play().catch(() => { })
    },

    swipeLeft: () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTAoOUKfk77RgGwU7k9jyz3YpBSV7y/DchUELFGGy6+eoVRQKRp/g8r5sIQUrgc7y2Yk2CBlouvDknEwKDlCn5O+0YBsF')
        audio.volume = 0.3
        audio.playbackRate = 0.8
        audio.play().catch(() => { })
    },

    complete: () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTAoOUKfk77RgGwU7k9jyz3YpBSV7y/DchUELFGGy6+eoVRQKRp/g8r5sIQUrgc7y2Yk2CBlouvDknEwKDlCn5O+0YBsF')
        audio.volume = 0.5
        audio.play().catch(() => { })
    },

    error: () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi78OScTAoOUKfk77RgGwU7k9jyz3YpBSV7y/DchUELFGGy6+eoVRQKRp/g8r5sIQUrgc7y2Yk2CBlouvDknEwKDlCn5O+0YBsF')
        audio.volume = 0.3
        audio.playbackRate = 0.6
        audio.play().catch(() => { })
    }
}

export function playSound(type: keyof typeof sounds, enabled: boolean = true) {
    if (!enabled) return
    sounds[type]?.()
}
