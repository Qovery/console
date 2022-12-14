import { render } from '@testing-library/react'
import PageClustersGeneral from './page-clusters-general'

describe('PageClustersGeneral', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageClustersGeneral />)
    expect(baseElement).toBeTruthy()
  })
})
