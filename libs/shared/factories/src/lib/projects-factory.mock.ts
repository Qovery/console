import { Chance } from 'chance'
import { type Project } from 'qovery-typescript-axios'

const chance = new Chance('123')

export const projectsFactoryMock = (howMany: number): Project[] =>
  Array.from({ length: howMany }).map((_, index) => ({
    id: `${index}`,
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    name: chance.name(),
    description: chance.word({ length: 10 }),
    organization: {
      id: '',
    },
  }))
