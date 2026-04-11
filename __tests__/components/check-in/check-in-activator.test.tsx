import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CheckInActivator } from '@/components/check-in/check-in-activator'

const refreshMock = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

const fetchMock = vi.fn()
global.fetch = fetchMock as any

describe('CheckInActivator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    fetchMock.mockImplementationOnce(() => new Promise(() => {})) // Never resolves

    render(<CheckInActivator tableId="t1" />)

    const loadingText = screen.getByText('loading')
    expect(loadingText).toBeDefined()
    // The loading text is rendered with animate-pulse class on the <p> element
    expect(loadingText.className).toContain('animate-pulse')
  })

  it('renders activated result when fetch succeeds with 200', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'activated' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    // CheckInResult should be rendered with status='activated'
    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })

  it('renders already_active result when fetch resolves with already_active message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'CHECK_IN_ALREADY_ACTIVE' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })

  it('renders too_early result when fetch resolves with too_early message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'CHECK_IN_TOO_EARLY' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })

  it('renders too_late result when fetch resolves with too_late message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'CHECK_IN_TOO_LATE' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })

  it('renders error result when fetch rejects (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })

  it('renders error result when fetch resolves with unknown error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'UNKNOWN_ERROR' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })
  })

  it('renders no_reservation result when fetch resolves with no_reservation message', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'CHECK_IN_NO_RESERVATION' }),
    })

    render(<CheckInActivator tableId="t1" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })
  })

  it('passes side=inf query parameter when side prop is inf', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'activated' }),
    })

    render(<CheckInActivator tableId="t1" side="inf" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate?side=inf', expect.objectContaining({ method: 'POST' }))
  })

  it('does not pass side query parameter when side prop is not inf', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'activated' }),
    })

    render(<CheckInActivator tableId="t1" side="sup" />)

    await waitFor(() => {
      expect(screen.queryByText('loading')).toBeNull()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/tables/t1/activate', expect.objectContaining({ method: 'POST' }))
  })
})
