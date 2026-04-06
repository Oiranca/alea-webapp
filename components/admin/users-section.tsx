'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser } from '@/lib/hooks/use-admin'
import type { User } from '@/lib/types'

const PAGE_SIZE = 10

export function UsersSection() {
  const t = useTranslations('admin')
  const tc = useTranslations('common')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editMemberNumber, setEditMemberNumber] = useState('')
  const [editRole, setEditRole] = useState<'member' | 'admin'>('member')

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const { data, isLoading } = useAdminUsers(page, PAGE_SIZE, search)
  const updateUser = useAdminUpdateUser()
  const deleteUser = useAdminDeleteUser()

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setEditMemberNumber(user.memberNumber)
    setEditRole(user.role)
  }

  async function handleEditSave() {
    if (!editingUser) return
    await updateUser.mutateAsync({
      id: editingUser.id,
      data: { memberNumber: editMemberNumber, role: editRole },
    })
    setEditingUser(null)
  }

  async function handleDelete() {
    if (!deletingUserId) return
    await deleteUser.mutateAsync(deletingUserId)
    setDeletingUserId(null)
  }

  const users = data?.data ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <section aria-labelledby="users-heading" className="space-y-4">
      <h2 id="users-heading" className="font-cinzel text-xl font-semibold text-foreground">
        {t('userManagement')}
      </h2>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('searchUsers')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">{tc('search')}</Button>
      </form>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rpg-card p-8 text-center text-muted-foreground">
          {t('noUsers')}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('memberNumber')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('role')}</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('joinDate')}</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">#{user.memberNumber}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === 'admin' ? 'reserved' : 'outline'}>
                      {t(user.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('editUser')}
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('deleteUser')}
                        className="text-destructive-foreground hover:bg-destructive/15"
                        onClick={() => setDeletingUserId(user.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {tc('page')} {page} {tc('of')} {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label={tc('previous')}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label={tc('next')}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-cinzel">{t('editUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-member-number">{t('memberNumber')}</Label>
              <Input
                id="edit-member-number"
                value={editMemberNumber}
                onChange={(e) => setEditMemberNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t('role')}</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'member' | 'admin')}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">{t('member')}</SelectItem>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>{tc('cancel')}</Button>
            <Button onClick={handleEditSave} disabled={updateUser.isPending}>
              {updateUser.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />{t('saving')}</>
                : tc('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-cinzel">{t('deleteUser')}</DialogTitle>
            <DialogDescription>{t('deleteUserConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUserId(null)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1" aria-hidden="true" />{t('deleting')}</>
                : tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
