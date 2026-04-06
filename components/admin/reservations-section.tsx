'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useAdminReservations, useAdminCancelReservation } from '@/lib/hooks/use-admin'
import { formatDate, formatTime } from '@/lib/utils'
import type { Reservation } from '@/lib/types'

export function ReservationsSection() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')
  const tr = useTranslations('reservations')

  const { data: reservations, isLoading } = useAdminReservations()
  const cancelReservation = useAdminCancelReservation()
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  async function handleCancel() {
    if (!cancelingId) return
    await cancelReservation.mutateAsync(cancelingId)
    setCancelingId(null)
  }

  const statusVariant: Record<Reservation['status'], 'available' | 'reserved' | 'outline'> = {
    active: 'available',
    cancelled: 'reserved',
    completed: 'outline',
  }

  const sorted = [...(reservations ?? [])].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
  })

  return (
    <section aria-labelledby="reservations-heading" className="space-y-4">
      <h2 id="reservations-heading" className="font-cinzel text-xl font-semibold text-foreground">
        {t('reservationManagement')}
      </h2>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-md" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="rpg-card p-8 text-center text-muted-foreground">
          {t('noReservations')}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('user')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tc('date')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tc('time')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{tc('status')}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={r.userId}>
                    {r.userId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={r.tableId}>
                    {r.tableId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(r.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatTime(r.startTime)} — {formatTime(r.endTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[r.status]}>
                      {tr(r.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive-foreground hover:bg-destructive/15"
                        onClick={() => setCancelingId(r.id)}
                      >
                        {t('cancelReservation')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel confirmation */}
      <Dialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-cinzel">{t('cancelReservation')}</DialogTitle>
            <DialogDescription>{t('cancelReservationConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelingId(null)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelReservation.isPending}
            >
              {cancelReservation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />{t('saving')}</>
                : tc('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
