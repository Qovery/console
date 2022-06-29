import { setupServer } from 'msw/node'

const handlers = []

export const server = setupServer(...handlers)
