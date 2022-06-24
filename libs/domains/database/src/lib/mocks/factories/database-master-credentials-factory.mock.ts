import { Chance } from 'chance'
import { Credentials } from 'qovery-typescript-axios'

const chance = new Chance()

export const databaseMasterCredentialsFactoryMock = (howMany: number): Credentials[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    login: chance.name(),
    password: chance.guid(),
    host: chance.name(),
    port: chance.d4(),
  }))
