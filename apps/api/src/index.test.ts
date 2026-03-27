import test from 'node:test'
import assert from 'node:assert/strict'
import { server } from './index.js'

test('server instance exists', () => {
  assert.ok(server)
})
