import { render } from '@testing-library/react'
import PageDatabaseCreateGeneral from './page-database-create-general'

describe('PageDatabaseCreateGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreateGeneral />)
    expect(baseElement).toBeTruthy()
  })
})
