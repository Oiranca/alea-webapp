import { describe, expect, it } from 'vitest'
import { ServiceError } from '@/lib/server/service-error'
import { toServiceErrorResponse } from '@/lib/server/http-error'

describe('toServiceErrorResponse', () => {
  it('maps a ServiceError into a JSON response', async () => {
    const response = toServiceErrorResponse(new ServiceError('Unauthorized', 401))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      message: 'Unauthorized',
      statusCode: 401,
    })
  })

  it('falls back to a 500 response for unknown errors', async () => {
    const response = toServiceErrorResponse(new Error('boom'))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: 'Internal server error',
      statusCode: 500,
    })
  })
})
