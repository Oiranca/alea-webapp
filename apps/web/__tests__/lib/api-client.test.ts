import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()

describe('api client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn(async () => ({ ok: true })),
    })
  })

  it('adds the CSRF header automatically for unsafe requests', async () => {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      value: 'alea-csrf-token=test-csrf-token',
    })

    const { apiClient } = await import('@/lib/api/client')

    await apiClient.post('/auth/login', { identifier: 'admin@alea.club', password: 'secret' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-csrf-token': 'test-csrf-token',
        }),
      }),
    )
  })
})
