export async function adToBsApi(adDate: Date): Promise<string> {
  const dateStr = `${adDate.getFullYear()}-${String(adDate.getMonth() + 1).padStart(2, '0')}-${String(adDate.getDate()).padStart(2, '0')}`

  try {
    const res = await fetch(`https://raw.githubusercontent.com/AnmupOnline/nepalicalendar/main/convertToBS/${dateStr}`)
    if (!res.ok) throw new Error('Failed to fetch')
    const text = await res.text()
    return text.trim()
  } catch {
    throw new Error('Failed to convert AD to BS date')
  }
}

export function formatDateForInput(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
