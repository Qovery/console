import { render } from '@testing-library/react'
import RowEventFeature from './row-event-feature'

describe('RowEventFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RowEventFeature />)
    expect(baseElement).toBeTruthy()
  })
})
