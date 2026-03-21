const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const REQUEST_TIMEOUT_MS = 30000

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. MedNexus AI backend is taking too long to respond.`)
    }
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${API_BASE}. Start the MedNexus backend server and try again.`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
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
