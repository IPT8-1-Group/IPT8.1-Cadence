export function getUserError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Ein unbekannter Fehler ist aufgetreten.'
  }

  if (error.message.includes('401') || error.message.includes('403')) {
    return 'E-Mail-Adresse oder Passwort ist falsch.'
  }

  if (error.message.includes('409')) {
    return 'Dieser Benutzername oder diese E-Mail-Adresse existiert bereits.'
  }

  if (error.message.includes('429')) {
    return 'Zu viele Anmeldeversuche versuche es später nochmals.'
  }

  if (error.message.includes('500')) {
    return 'Der Server hat ein Problem zurzeit versuche es später nochmals.'
  }

  if (error.message.includes('Failed to fetch')) {
    return 'Keine Verbindung zum Server möglich.'
  }

  return 'Die Anmeldung ist fehlgeschlagen'
}
