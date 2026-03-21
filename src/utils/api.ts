const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${API_BASE}. Start the MedNexus backend server and try again.`)
    }
    throw error
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

export const aiAPI = {
  chat: (message: string) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}
