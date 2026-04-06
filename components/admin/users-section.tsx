'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight,
  Users, ShieldCheck, X,
} from 'lucide-react'
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

  function handleClearSearch() {
    setSearchInput('')
    setSearch('')
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
    <section aria-labelledby="users-heading" className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
          <Users className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <h2 id="users-heading" className="font-cinzel text-xl font-semibold text-foreground">
          {t('userManagement')}
        </h2>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            type="search"
            placeholder={t('searchUsers')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-9 bg-background-secondary border-border focus:border-primary/50 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={tc('clear')}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <Button type="submit" variant="outline" size="sm" className="border-primary/30 hover:border-primary/60 hover:bg-primary/10 hover:text-primary transition-colors">
          {tc('search')}
        </Button>
      </form>

      {/* Table / loading / empty */}
      {isLoading ? (
        <div className="space-y-2 rounded-lg border border-border overflow-hidden">
          {/* Fake header */}
          <div className="bg-background-secondary/80 px-4 py-3 grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-12 rounded ml-auto" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 grid grid-cols-4 gap-4 border-t border-border/40">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-7 w-16 rounded ml-auto" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rpg-card p-12 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
            <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div>
            <p className="font-cinzel text-sm font-semibold text-muted-foreground">{t('noUsers')}</p>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                {tc('clearSearch')}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto bg-background-secondary/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-secondary/80">
                <th className="px-4 py-3 text-left font-cinzel text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('memberNumber')}
                </th>
                <th className="px-4 py-3 text-left font-cinzel text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-4 py-3 text-left font-cinzel text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  {t('joinDate')}
                </th>
                <th className="px-4 py-3 text-right font-cinzel text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {tc('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`hover:bg-primary/5 transition-colors group ${idx % 2 === 0 ? '' : 'bg-background-secondary/30'}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-foreground font-medium">
                      #{user.memberNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <Badge variant="reserved" className="gap-1">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                        {t('admin')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {t('member')}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('editUser')}
                        onClick={() => openEdit(user)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-70 group-hover:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('deleteUser')}
                        onClick={() => setDeletingUserId(user.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-crimson-light hover:bg-crimson-dark/20 transition-colors opacity-70 group-hover:opacity-100"
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{tc('page')} {page}</span>
            {' '}{tc('of')}{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border hover:border-primary/40 hover:bg-primary/10 disabled:opacity-30 transition-colors"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label={tc('previous')}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border hover:border-primary/40 hover:bg-primary/10 disabled:opacity-30 transition-colors"
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
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-gradient-gold">{t('editUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-member-number" className="text-sm text-muted-foreground font-medium">
                {t('memberNumber')}
              </Label>
              <Input
                id="edit-member-number"
                value={editMemberNumber}
                onChange={(e) => setEditMemberNumber(e.target.value)}
                className="bg-background-secondary border-border focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-sm text-muted-foreground font-medium">
                {t('role')}
              </Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'member' | 'admin')}>
                <SelectTrigger id="edit-role" className="bg-background-secondary border-border">
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
            <Button variant="outline" onClick={() => setEditingUser(null)} className="border-border">
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateUser.isPending}
              className="min-w-[80px]"
            >
              {updateUser.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('saving')}</>
              ) : tc('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-crimson-dark/20 border border-crimson/30">
                <Trash2 className="h-5 w-5 text-crimson-light" aria-hidden="true" />
              </div>
              <DialogTitle className="font-cinzel text-foreground">{t('deleteUser')}</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground leading-relaxed">
              {t('deleteUserConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setDeletingUserId(null)} className="border-border">
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="bg-crimson hover:bg-crimson-light text-white border-0 min-w-[80px]"
            >
              {deleteUser.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{t('deleting')}</>
              ) : tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
