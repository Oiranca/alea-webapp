import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { GameTable, Reservation, Room, Role, TableAvailability, TableSurface, TimeSlot, User } from '@/lib/types'

type StoredUser = User & {
  passwordHash: string
  passwordSalt: string
}

const BASE_ROOMS: Room[] = [
  { id: '1', name: 'Sala Mirkwood', tableCount: 8, description: 'Sala principal de rol y estrategia' },
  { id: '2', name: 'Sala Gondolin', tableCount: 6, description: 'Sala de juegos de mesa clasicos' },
  { id: '3', name: 'Sala Khazad-dum', tableCount: 10, description: 'Sala grande para torneos y eventos' },
  { id: '4', name: 'Sala Rivendell', tableCount: 4, description: 'Sala intima para partidas pequenas' },
  { id: '5', name: 'Sala Lothlorien', tableCount: 6, description: 'Sala tematica de fantasia' },
  { id: '6', name: 'Sala Edoras', tableCount: 5, description: 'Sala de wargames y miniaturas' },
]

function generateTables(roomId: string, count: number): GameTable[] {
  const types = ['small', 'large', 'removable_top'] as const
  return Array.from({ length: count }, (_, i) => ({
    id: `r${roomId}t${i + 1}`,
    roomId,
    name: `Mesa ${i + 1}`,
    type: types[i % 3],
    qrCode: `QR_R${roomId}T${i + 1}`,
    position: { x: i % 3, y: Math.floor(i / 3) },
  }))
}

const TABLES_BY_ROOM: Record<string, GameTable[]> = {
  '1': generateTables('1', 8),
  '2': generateTables('2', 6),
  '3': generateTables('3', 10),
  '4': generateTables('4', 4),
  '5': generateTables('5', 6),
  '6': generateTables('6', 5),
}

TABLES_BY_ROOM['1'][0] = { ...TABLES_BY_ROOM['1'][0], id: 't1', type: 'large' }
TABLES_BY_ROOM['1'][2] = { ...TABLES_BY_ROOM['1'][2], id: 't3', type: 'removable_top' }
TABLES_BY_ROOM['6'][0] = { ...TABLES_BY_ROOM['6'][0], id: 't6', type: 'removable_top' }

const TABLES_BY_ID = Object.values(TABLES_BY_ROOM).flat().reduce<Record<string, GameTable>>((acc, table) => {
  acc[table.id] = table
  return acc
}, {})

function createPasswordHash(password: string, salt?: string) {
  const chosenSalt = salt ?? randomBytes(16).toString('hex')
  const hash = scryptSync(password, chosenSalt, 64).toString('hex')
  return { hash, salt: chosenSalt }
}

function createSeedUser(params: {
  id: string
  memberNumber: string
  email: string
  role: Role
  password: string
}): StoredUser {
  const now = '2024-01-01T00:00:00Z'
  const { hash, salt } = createPasswordHash(params.password)
  return {
    id: params.id,
    memberNumber: params.memberNumber,
    email: params.email,
    role: params.role,
    createdAt: now,
    updatedAt: now,
    passwordHash: hash,
    passwordSalt: salt,
  }
}

const USERS: StoredUser[] = [
  createSeedUser({
    id: '1',
    memberNumber: '100001',
    email: 'admin@alea.club',
    role: 'admin',
    password: 'Admin1234!@#',
  }),
  createSeedUser({
    id: '2',
    memberNumber: '100002',
    email: 'socio@alea.club',
    role: 'member',
    password: 'Socio1234!@#',
  }),
]

const today = new Date().toISOString().split('T')[0]
const RESERVATIONS: Reservation[] = [
  { id: 'r1', tableId: 't1', userId: '2', date: today, startTime: '16:00', endTime: '18:00', status: 'active', createdAt: new Date().toISOString() },
  { id: 'r2', tableId: 't3', userId: '2', date: today, startTime: '10:00', endTime: '12:00', status: 'active', surface: 'top', createdAt: new Date().toISOString() },
]

function toPublicUser(user: StoredUser): User {
  const { passwordHash: _h, passwordSalt: _s, ...safeUser } = user
  return safeUser
}

export function findUserByIdentifier(identifier: string) {
  return USERS.find((u) => u.memberNumber === identifier || u.email.toLowerCase() === identifier.toLowerCase()) ?? null
}

export function findUserByEmail(email: string) {
  return USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
}

export function findUserById(id: string) {
  return USERS.find((u) => u.id === id) ?? null
}

export function verifyUserPassword(user: StoredUser, inputPassword: string) {
  const derived = scryptSync(inputPassword, user.passwordSalt, 64)
  const stored = Buffer.from(user.passwordHash, 'hex')
  return derived.length === stored.length && timingSafeEqual(derived, stored)
}

export function createUser(params: { memberNumber: string; email: string; password: string; role?: Role }): User {
  const now = new Date().toISOString()
  const { hash, salt } = createPasswordHash(params.password)
  const user: StoredUser = {
    id: String(Date.now()),
    memberNumber: params.memberNumber,
    email: params.email,
    role: params.role ?? 'member',
    createdAt: now,
    updatedAt: now,
    passwordHash: hash,
    passwordSalt: salt,
  }
  USERS.push(user)
  return toPublicUser(user)
}

export function listUsers() {
  return USERS.map(toPublicUser)
}

export function updateUserById(id: string, data: Partial<Pick<User, 'memberNumber' | 'email' | 'role'>>) {
  const user = findUserById(id)
  if (!user) return null
  if (data.memberNumber) user.memberNumber = data.memberNumber
  if (data.email) user.email = data.email
  if (data.role) user.role = data.role
  user.updatedAt = new Date().toISOString()
  return toPublicUser(user)
}

export function deleteUserById(id: string) {
  const index = USERS.findIndex((u) => u.id === id)
  if (index === -1) return false
  USERS.splice(index, 1)
  return true
}

export function getPublicUser(user: StoredUser | User) {
  if ('passwordHash' in user) return toPublicUser(user)
  return user
}

export function listRooms() {
  return BASE_ROOMS
}

export function createRoom(input: { name: string; tableCount?: number; description?: string }) {
  const room: Room = {
    id: String(Date.now()),
    name: input.name,
    tableCount: input.tableCount ?? 0,
    description: input.description,
  }
  BASE_ROOMS.push(room)
  TABLES_BY_ROOM[room.id] = generateTables(room.id, room.tableCount)
  for (const table of TABLES_BY_ROOM[room.id]) TABLES_BY_ID[table.id] = table
  return room
}

export function updateRoomById(id: string, data: Partial<Pick<Room, 'name' | 'description' | 'tableCount'>>) {
  const room = BASE_ROOMS.find((r) => r.id === id)
  if (!room) return null
  if (data.name) room.name = data.name
  if (data.description !== undefined) room.description = data.description
  return room
}

export function getRoomTables(roomId: string) {
  return TABLES_BY_ROOM[roomId] ?? []
}

export function getTableById(tableId: string) {
  return TABLES_BY_ID[tableId] ?? null
}

export function listReservations(filters?: { userId?: string; tableId?: string; date?: string }) {
  let items = [...RESERVATIONS]
  if (filters?.userId) items = items.filter((r) => r.userId === filters.userId)
  if (filters?.tableId) items = items.filter((r) => r.tableId === filters.tableId)
  if (filters?.date) items = items.filter((r) => r.date === filters.date)
  return items
}

export function createReservation(input: {
  tableId: string
  userId: string
  date: string
  startTime: string
  endTime: string
  surface?: TableSurface
}) {
  const reservation: Reservation = {
    id: `r${Date.now()}`,
    tableId: input.tableId,
    userId: input.userId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    status: 'active',
    surface: input.surface ?? null,
    createdAt: new Date().toISOString(),
  }
  RESERVATIONS.push(reservation)
  return reservation
}

export function updateReservationById(id: string, patch: Partial<Reservation>) {
  const reservation = RESERVATIONS.find((r) => r.id === id)
  if (!reservation) return null
  Object.assign(reservation, patch)
  return reservation
}

export function findReservationById(id: string) {
  return RESERVATIONS.find((r) => r.id === id) ?? null
}

export function hasReservationConflict(input: {
  tableId: string
  date: string
  startTime: string
  endTime: string
  surface?: TableSurface
  ignoreReservationId?: string
}) {
  return RESERVATIONS.some((r) => {
    if (r.status !== 'active') return false
    if (input.ignoreReservationId && r.id === input.ignoreReservationId) return false
    if (r.tableId !== input.tableId || r.date !== input.date) return false
    if (input.surface && r.surface && input.surface !== r.surface) return false
    return r.startTime < input.endTime && input.startTime < r.endTime
  })
}

function generateDaySlots(reservedSlots: Array<{ start: string; end: string }>): TimeSlot[] {
  return Array.from({ length: 13 }, (_, i) => {
    const h = 9 + i
    const time = `${String(h).padStart(2, '0')}:00`
    const nextTime = `${String(h + 1).padStart(2, '0')}:00`
    const isReserved = reservedSlots.some((r) => r.start <= time && r.end > time)
    return { startTime: time, endTime: nextTime, available: !isReserved }
  })
}

export function buildTableAvailability(tableId: string, date: string): TableAvailability {
  const table = getTableById(tableId)
  const activeReservations = RESERVATIONS.filter((r) => r.tableId === tableId && r.date === date && r.status === 'active')
  const reserved = activeReservations.map((r) => ({ start: r.startTime, end: r.endTime, surface: r.surface ?? undefined }))
  const availability: TableAvailability = {
    tableId,
    date,
    slots: generateDaySlots(reserved),
  }

  if (table?.type === 'removable_top') {
    const topReserved = reserved.filter((r) => !r.surface || r.surface === 'top')
    const bottomReserved = reserved.filter((r) => r.surface === 'bottom')
    availability.top = generateDaySlots(topReserved)
    availability.bottom = generateDaySlots(bottomReserved)
    availability.conflicts = generateDaySlots(reserved)
  }

  return availability
}
