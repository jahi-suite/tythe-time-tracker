const API = '/api'

async function fetchApi<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...opts?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export interface AuthUser {
  id: string
  username: string
  role: 'employee' | 'manager' | 'admin'
  display_name: string
}

export interface VenueSearchResult {
  slug: string
  name: string
}

export interface CreateVenueResponse {
  redirectUrl: string
  venue: { slug: string; name: string }
}

export const venues = {
  search: (q: string) =>
    fetchApi<VenueSearchResult[]>(`/venues/search?q=${encodeURIComponent(q)}`),
  create: (data: {
    venueName: string
    adminUsername: string
    adminDisplayName: string
    adminPassword: string
  }) =>
    fetchApi<CreateVenueResponse>('/venues', {
      method: 'POST',
      body: JSON.stringify({
        venueName: data.venueName,
        username: data.adminUsername,
        displayName: data.adminDisplayName,
        password: data.adminPassword,
      }),
    }),
}

export const auth = {
  me: (venueSlug?: string) =>
    fetchApi<AuthUser>(`/auth/me${venueSlug ? `?venue_slug=${encodeURIComponent(venueSlug)}` : ''}`),
  login: (username: string, password: string, venueSlug = 'tythe') =>
    fetchApi<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, venue_slug: venueSlug }),
    }),
  logout: () => fetchApi<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    fetchApi<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  firstSetup: (venueSlug = 'tythe') =>
    fetchApi<{ needsSetup: boolean }>(`/auth/first-setup?venue_slug=${encodeURIComponent(venueSlug)}`),
  createFirstAdmin: (username: string, password: string, displayName: string, venueSlug = 'tythe') =>
    fetchApi<{ ok: boolean }>('/auth/first-setup', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName, venue_slug: venueSlug }),
    }),
  adminCount: () => fetchApi<{ count: number }>('/auth/admin-count'),
}

export const clock = {
  in: (isSupervisor: boolean) =>
    fetchApi<{ ok: boolean }>('/clock/in', {
      method: 'POST',
      body: JSON.stringify({ isSupervisor }),
    }),
  out: () => fetchApi<{ ok: boolean }>('/clock/out', { method: 'POST' }),
  open: () => fetchApi<{ shift: { id: string; employee: string; clock_in: string; pay_rate_type: string } | null }>('/clock/open'),
}

export const timesheet = {
  get: (start?: string, end?: string) => {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    const q = params.toString()
    return fetchApi<{ entries: TimeEntry[] }>(`/timesheet${q ? '?' + q : ''}`)
  },
  getAll: (start?: string, end?: string) => {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    const q = params.toString()
    return fetchApi<{ entries: TimeEntry[] }>(`/timesheet/all${q ? '?' + q : ''}`)
  },
}

export interface TimeEntry {
  id: string
  employee: string
  clock_in: string
  clock_out: string | null
  pay_rate_type: string
  created_at: string
}

export const shifts = {
  add: (data: Record<string, unknown>) =>
    fetchApi<{ ok: boolean }>('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  edit: (id: string, data: Record<string, unknown>) =>
    fetchApi<{ ok: boolean }>(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ ok: boolean }>(`/shifts/${id}`, { method: 'DELETE' }),
  get: (id: string) => fetchApi<TimeEntry>(`/shifts/${id}`),
}

export const users = {
  list: () => fetchApi<{ users: User[] }>('/users'),
  create: (data: Record<string, unknown>) =>
    fetchApi<{ ok: boolean }>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    fetchApi<{ ok: boolean }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),
  activate: (id: string) => fetchApi<{ ok: boolean }>(`/users/${id}/activate`, { method: 'POST' }),
  deactivate: (id: string) => fetchApi<{ ok: boolean }>(`/users/${id}/deactivate`, { method: 'POST' }),
  setPayRates: (id: string, data: { standard?: number; enhanced?: number; supervisor?: number }) =>
    fetchApi<{ ok: boolean }>(`/users/${id}/pay-rates`, { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (id: string, newPassword: string) =>
    fetchApi<{ ok: boolean }>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
  promoteAdmin: (id: string) =>
    fetchApi<{ ok: boolean }>(`/users/${id}/promote-admin`, { method: 'POST' }),
}

export interface User {
  id: string
  username: string
  role: string
  display_name: string
  active: boolean
  standard_rate?: number | null
  enhanced_rate?: number | null
  supervisor_rate?: number | null
}

export const audit = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchApi<{ logs: AuditLog[] }>(`/audit${q}`)
  },
}

export interface AuditLog {
  id: string
  action: string
  target_table: string
  target_id: string | null
  changed_by: string
  old_values: unknown
  new_values: unknown
  created_at: string
}

export function exportExcelUrl(employee?: string, start?: string, end?: string): string {
  const params = new URLSearchParams()
  if (employee) params.set('employee', employee)
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  return `${API}/export/excel?${params.toString()}`
}

export function exportPdfUrl(employee?: string, start?: string, end?: string): string {
  const params = new URLSearchParams()
  if (employee) params.set('employee', employee)
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  return `${API}/export/pdf?${params.toString()}`
}
