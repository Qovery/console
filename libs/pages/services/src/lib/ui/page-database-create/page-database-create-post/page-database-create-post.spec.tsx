import { render } from '@testing-library/react'
import PageDatabaseCreatePost from './page-database-create-post'

describe('PageDatabaseCreatePost', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageDatabaseCreatePost />)
    expect(baseElement).toBeTruthy()
  })
})
