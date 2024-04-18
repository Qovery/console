import { render } from '__tests__/utils/setup-jest'
import { projectsFactoryMock } from '@qovery/shared/factories'
import { PageGeneral, type PageGeneralProps } from './page-general'

let props: PageGeneralProps

const project = projectsFactoryMock(1)[0]

beforeEach(() => {
  props = {
    clusterAvailable: true,
    project,
  }
})

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
