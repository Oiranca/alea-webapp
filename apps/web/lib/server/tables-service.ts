import { buildTableAvailability, getTableById } from '@/lib/server/mock-db'
import { serviceError } from '@/lib/server/service-error'

function resolveDate(date?: string | null) {
  return date && date.trim() ? date : new Date().toISOString().split('T')[0]
}

export function getTableAvailability(tableId: string, date?: string | null) {
  const table = getTableById(tableId)
  if (!table) {
    serviceError('Table not found', 404)
  }

  return buildTableAvailability(tableId, resolveDate(date))
}
