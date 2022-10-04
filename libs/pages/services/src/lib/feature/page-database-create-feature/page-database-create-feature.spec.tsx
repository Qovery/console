import { render } from '@testing-library/react'
import PageDatabaseCreateFeature from './page-database-create-feature'

describe('PageDatabaseCreateFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreateFeature />)
    expect(baseElement).toBeTruthy()
  })
})
