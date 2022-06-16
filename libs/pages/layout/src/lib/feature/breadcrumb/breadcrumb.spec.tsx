import { render } from '__tests__/utils/setup-jest'
import { BreadcrumbFeature } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BreadcrumbFeature />)
    expect(baseElement).toBeTruthy()
  })
})
