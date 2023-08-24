import { Chance } from 'chance'
import { type SignUp, TypeOfUseEnum } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const userSignUpFactoryMock = (): SignUp => ({
  id: chance.guid(),
  created_at: new Date().toString(),
  first_name: chance.name(),
  last_name: chance.name(),
  qovery_usage: chance.word({ length: 10 }),
  type_of_use: chance.pickone(Object.values([TypeOfUseEnum.PERSONAL])),
  user_email: chance.email(),
})
