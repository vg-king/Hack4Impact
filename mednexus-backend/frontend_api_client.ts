// Copy this file into frontend: src/utils/api.ts
// It is kept here as a reference client for Team Nemesis.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

let authToken: string | null = null

export function setApiToken(token: string | null) {
  authToken = token
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`)
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const aiAPI = {
  chat: (message: string) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}

export const cvAPI = {
  detect: async (file: File, category = 'skin') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', category)
    return request('/api/cv/detect', { method: 'POST', body: fd })
  },
}

export const prescriptionAPI = {
  parse: async (file: File, patientId?: number) => {
    const fd = new FormData()
    fd.append('file', file)
    if (typeof patientId === 'number') fd.append('patient_id', String(patientId))
    return request('/api/prescription/parse', { method: 'POST', body: fd })
  },
}
