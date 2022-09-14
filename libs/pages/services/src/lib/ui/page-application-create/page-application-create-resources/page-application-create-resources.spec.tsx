import { render } from '@testing-library/react'
import PageApplicationCreateResources from './page-application-create-resources'

describe('PageApplicationCreateResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageApplicationCreateResources />)
    expect(baseElement).toBeTruthy()
  })
})
