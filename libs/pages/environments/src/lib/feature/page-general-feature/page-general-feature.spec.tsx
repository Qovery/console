import { render } from '__tests__/utils/setup-jest'
import { projectsFactoryMock } from '@qovery/shared/factories'
import PageGeneralFeature from './page-general-feature'

const mockProject = projectsFactoryMock(1)[0]

jest.mock('@qovery/domains/projects/feature', () => {
  return {
    ...jest.requireActual('@qovery/domains/projects/feature'),
    useProject: () => ({
      data: mockProject,
    }),
  }
})

describe('PageGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
