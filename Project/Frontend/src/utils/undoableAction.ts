import { notification, showNotification } from '@/utils/notification'

/** Während der Rückgängig-Frist bleiben die Originaldatensätze im Backend erhalten. */
export function showUndoableAction(options: {
  message: string
  undoMessage: string
  undo: () => void | Promise<void>
  commit: () => Promise<unknown>
}) {
  let state: 'pending' | 'undone' | 'committing' = 'pending'
  let timeout: ReturnType<typeof setTimeout> | undefined
  const restore = async () => {
    if (state !== 'pending') return
    state = 'undone'
    clearTimeout(timeout)
    await options.undo()
    showNotification(options.undoMessage)
  }
  showNotification(options.message, restore)
  const id = notification.value!.id
  timeout = setTimeout(async () => {
    if (state !== 'pending') return
    state = 'committing'
    if (notification.value?.id === id)
      notification.value = { ...notification.value, undo: undefined }
    try {
      await options.commit()
    } catch (error) {
      try {
        await options.undo()
      } catch {
        /* Der ursprüngliche Fehler bleibt sichtbar. */
      }
      showNotification(
        error instanceof Error ? error.message : 'Die Aktion konnte nicht gespeichert werden.',
      )
    }
  }, 6000)
}
