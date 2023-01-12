import { rest } from 'msw'
import { organizationFactoryMock } from './organizations-factory.mock'

export const organizationHandlerMock = rest.get('/organization', (req, res, ctx) => {
  return res(ctx.json(organizationFactoryMock(3)))
})
