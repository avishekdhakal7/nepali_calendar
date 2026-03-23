'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import axios from 'axios'

interface LogoUpdateResult {
  success: boolean
  logo_url?: string
  error?: string
}

function extractError(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    if (e.message && typeof e.message === 'string') return e.message
    if (e.error && typeof e.error === 'string') return e.error
    if (typeof e.detail === 'string') return e.detail
    return JSON.stringify(err)
  }
  return 'Unknown error'
}

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.toString()
  const accessToken = allCookies
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1]
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

export async function uploadSchoolLogoAction(
  schoolId: number,
  file: File
): Promise<LogoUpdateResult> {
  try {
    const headers = await getAuthHeaders()
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

    const formData = new FormData()
    formData.append('logo', file)

    const res = await axios.post(`${apiBase}/schools/${schoolId}/logo/`, formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    })

    revalidatePath('/school-admin/settings')

    return {
      success: true,
      logo_url: res.data?.logo,
    }
  } catch (err) {
    console.error('[uploadSchoolLogoAction]', err)
    return { success: false, error: extractError(err) }
  }
}

export async function deleteSchoolLogoAction(
  schoolId: number,
  _logoUrl: string
): Promise<LogoUpdateResult> {
  try {
    const headers = await getAuthHeaders()
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

    await axios.delete(`${apiBase}/schools/${schoolId}/logo/`, {
      headers,
      withCredentials: true,
    })

    revalidatePath('/school-admin/settings')

    return { success: true }
  } catch (err) {
    console.error('[deleteSchoolLogoAction]', err)
    return { success: false, error: extractError(err) }
  }
}
