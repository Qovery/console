import { rest } from 'msw'
import { organizationsFactoryMock } from '../factories'

export const organizationsHandlerMock = rest.get('/organization', (req, res, ctx) => {
  return res(ctx.json(organizationsFactoryMock(3)))
})
