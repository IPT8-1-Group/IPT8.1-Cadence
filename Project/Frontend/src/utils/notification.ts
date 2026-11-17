import { ref } from 'vue'

export const notification = ref<{
  id: number
  message: string
  undo?: () => void | Promise<void>
} | null>(null)

let notificationId = 0

export function showNotification(message: string, undo?: () => void | Promise<void>) {
  notification.value = { id: ++notificationId, message, undo }
}

export async function undoNotification() {
  const undo = notification.value?.undo
  notification.value = null

  try {
    await undo?.()
  } catch {
    showNotification('Die Aktion konnte nicht rückgängig gemacht werden.')
  }
}
