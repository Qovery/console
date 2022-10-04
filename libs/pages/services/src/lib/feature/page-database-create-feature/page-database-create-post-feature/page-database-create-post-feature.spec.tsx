import { render } from '@testing-library/react'
import PageDatabaseCreatePostFeature from './page-database-create-post-feature'

describe('PageDatabaseCreatePostFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreatePostFeature />)
    expect(baseElement).toBeTruthy()
  })
})
