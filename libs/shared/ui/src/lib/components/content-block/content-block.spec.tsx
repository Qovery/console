import { render } from '@testing-library/react'

import ContentBlock from './content-block'

describe('ContentBlock', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContentBlock />)
    expect(baseElement).toBeTruthy()
  })
})
