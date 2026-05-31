import { useState, useEffect, useCallback } from 'react'

export function useAutoUpdate() {
    const [updateInfo, setUpdateInfo] = useState(null)
    const [progress, setProgress] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        const handleUpdateAvailable = (event) => {
            const data = event.detail
            if (data && data.has_update) {
                setUpdateInfo(data)
            }
        }

        const handleUpdateProgress = (event) => {
            const data = event.detail
            setProgress(data)
            if (data && data.status === 'error') {
                setIsUpdating(false)
            }
        }

        window.addEventListener('eelUpdateAvailable', handleUpdateAvailable)
        window.addEventListener('eelUpdateProgress', handleUpdateProgress)

        return () => {
            window.removeEventListener('eelUpdateAvailable', handleUpdateAvailable)
            window.removeEventListener('eelUpdateProgress', handleUpdateProgress)
        }
    }, [])

    const checkForUpdate = useCallback(async () => {
        if (!window.eel) return
        const data = await window.eel.check_for_update()()
        if (data && data.has_update) {
            setUpdateInfo(data)
        }
    }, [])

    useEffect(() => {
        const runCheck = () => {
            checkForUpdate()
        }

        if (window.eel?.check_for_update) {
            checkForUpdate()
        }

        window.addEventListener('eelReady', runCheck)

        return () => {
            window.removeEventListener('eelReady', runCheck)
        }
    }, [checkForUpdate])

    const startUpdate = useCallback(async () => {
        if (!window.eel || !updateInfo || !updateInfo.download_url) return
        setIsUpdating(true)
        setProgress({ status: 'starting', percent: 0, error: '' })
        await window.eel.download_and_apply_update(updateInfo.download_url)()
    }, [updateInfo])

    const dismissUpdate = useCallback(() => {
        setUpdateInfo(null)
    }, [])

    return {
        updateInfo,
        progress,
        isUpdating,
        checkForUpdate,
        startUpdate,
        dismissUpdate
    }
}
