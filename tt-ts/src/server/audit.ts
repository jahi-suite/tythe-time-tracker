import { insertAuditLog } from './db/repository.js'

export async function logChange(
  action: 'add' | 'edit' | 'delete',
  targetTable: string,
  targetId: string | null,
  changedBy: string,
  oldValues?: Record<string, unknown> | null,
  newValues?: Record<string, unknown> | null
): Promise<void> {
  if (!changedBy?.trim()) throw new Error('changed_by is required')
  await insertAuditLog(action, targetTable, targetId, changedBy, oldValues ?? null, newValues ?? null)
}

export { getAuditLogs } from './db/repository.js'
