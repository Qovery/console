import { render } from '@testing-library/react'
import PageOrganizationGeneral from './page-organization-general'

describe('PageOrganizationGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageOrganizationGeneral />)
    expect(baseElement).toBeTruthy()
  })
})
