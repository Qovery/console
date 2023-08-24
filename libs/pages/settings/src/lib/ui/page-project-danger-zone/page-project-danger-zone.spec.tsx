import { render } from '__tests__/utils/setup-jest'
import PageProjectDangerZone, { type PageProjectDangerZoneProps } from './page-project-danger-zone'

const props: PageProjectDangerZoneProps = {
  deleteProject: jest.fn(),
  loading: false,
}

describe('PageProjectDangerZone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageProjectDangerZone {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
