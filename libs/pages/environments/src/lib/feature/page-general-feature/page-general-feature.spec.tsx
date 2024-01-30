import { render } from '__tests__/utils/setup-jest'
import * as domainsProjectsFeature from '@qovery/domains/projects/feature'
import { projectsFactoryMock } from '@qovery/shared/factories'
import PageGeneralFeature from './page-general-feature'

const project = projectsFactoryMock(1)[0]

jest.spyOn(domainsProjectsFeature, 'useProject').mockReturnValue({
  data: project,
  isError: false,
  isLoading: false,
})

describe('PageGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
