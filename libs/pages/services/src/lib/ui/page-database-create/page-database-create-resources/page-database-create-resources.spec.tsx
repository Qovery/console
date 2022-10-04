import { render } from '@testing-library/react'
import PageDatabaseCreateResources from './page-database-create-resources'

describe('PageDatabaseCreateResources', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreateResources />)
    expect(baseElement).toBeTruthy()
  })
})
