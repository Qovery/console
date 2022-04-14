import { render } from '__tests__/utils/setup-jest'

import Overview from './overview'
import { projectsFactoryMock } from '@console/domains/projects'
import { Project } from 'qovery-typescript-axios'

describe('Overview', () => {
  let projects: Project[]
  beforeEach(() => {
    projects = projectsFactoryMock(2)
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Overview projects={projects} />)
    expect(baseElement).toBeTruthy()
  })
})
