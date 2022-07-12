import { render } from '@testing-library/react'

import BlockContent from './block-content'

describe('BlockContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BlockContent title="Test">
        <p>Test block</p>
      </BlockContent>
    )
    expect(baseElement).toBeTruthy()
  })
})
