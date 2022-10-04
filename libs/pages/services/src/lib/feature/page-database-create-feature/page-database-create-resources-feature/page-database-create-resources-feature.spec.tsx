import { render } from '@testing-library/react'
import PageDatabaseCreateResourcesFeature from './page-database-create-resources-feature'

describe('PageDatabaseCreateResourcesFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreateResourcesFeature />)
    expect(baseElement).toBeTruthy()
  })
})
