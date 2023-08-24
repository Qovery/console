import { Chance } from 'chance'
import { type GitAuthProvider, GitProviderEnum } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const authProviderFactoryMock = (howMany: number): GitAuthProvider[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    name: chance.pickone(Object.values(GitProviderEnum)),
    owner: chance.name(),
  }))
