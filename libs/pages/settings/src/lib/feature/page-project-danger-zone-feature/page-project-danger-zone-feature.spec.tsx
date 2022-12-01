import { render } from '__tests__/utils/setup-jest'
import PageProjectDangerZoneFeature from './page-project-danger-zone-feature'

describe('PageProjectDangerZoneFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageProjectDangerZoneFeature />)
    expect(baseElement).toBeTruthy()
  })
})
