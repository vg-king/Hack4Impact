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

export const authAPI = {
  register: (payload: { name: string; email: string; password: string }) =>
    request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
}

export const patientAPI = {
  list: () => request('/api/patients/'),
  create: (payload: { name: string; age?: number; gender?: string; phone?: string }) =>
    request('/api/patients/', { method: 'POST', body: JSON.stringify(payload) }),
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

export const drugsAPI = {
  check: (drugs: string[], patient_id?: number) =>
    request('/api/drugs/check', { method: 'POST', body: JSON.stringify({ drugs, patient_id }) }),
}

export const genomicsAPI = {
  analyze: (variants: string[]) =>
    request('/api/genomics/analyze', { method: 'POST', body: JSON.stringify({ variants }) }),
}

export const iotAPI = {
  saveVitals: (payload: {
    patient_id: number
    heart_rate?: number
    spo2?: number
    temperature?: number
    steps?: number
  }) => request('/api/iot/vitals', { method: 'POST', body: JSON.stringify(payload) }),
  getVitals: (patientId: number) => request(`/api/iot/vitals/${patientId}`),
  liveUrl: (patientId: number) => `${API_BASE.replace('http', 'ws')}/api/iot/live/${patientId}`,
}

export const hospitalAPI = {
  getBeds: () => request('/api/hospital/beds'),
  updateBeds: (total_beds: number, occupied_beds: number) =>
    request('/api/hospital/beds', {
      method: 'PUT',
      body: JSON.stringify({ total_beds, occupied_beds }),
    }),
}

export const emergencyAPI = {
  sos: (payload: { patient_name?: string; lat?: number; lng?: number; message?: string }) =>
    request('/api/emergency/sos', { method: 'POST', body: JSON.stringify(payload) }),
  nearestHospitals: (lat: number, lng: number) =>
    request(`/api/emergency/nearest-hospitals?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`),
}
