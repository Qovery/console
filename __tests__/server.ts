import { organizationHandlerMock } from '@console/domains/organization'
import { setupServer } from 'msw/node'

const handlers = [organizationHandlerMock]

export const server = setupServer(...handlers)
