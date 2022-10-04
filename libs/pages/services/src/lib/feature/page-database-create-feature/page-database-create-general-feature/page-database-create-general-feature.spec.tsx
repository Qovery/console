import { render } from '@testing-library/react'
import PageDatabaseCreateGeneralFeature from './page-database-create-general-feature'

describe('PageDatabaseCreateGeneralFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreateGeneralFeature />)
    expect(baseElement).toBeTruthy()
  })
})
