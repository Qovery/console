import { setupServer } from 'msw/node'
import { organizationsHandlerMock } from '../libs/domains/organizations/src'

const handlers = [organizationsHandlerMock]

export const server = setupServer(...handlers)
