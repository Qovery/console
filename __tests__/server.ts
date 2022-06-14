import { setupServer } from 'msw/node'
import { organizationHandlerMock } from '../libs/domains/organization/src'

const handlers = [organizationHandlerMock]

export const server = setupServer(...handlers)
