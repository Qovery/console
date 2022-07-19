import { render } from '__tests__/utils/setup-jest'

import BlockContentDelete from './block-content'

describe('BlockContentDelete', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <BlockContentDelete title="Test">
        <p>Test block</p>
      </BlockContentDelete>
    )
    expect(baseElement).toBeTruthy()
  })
})
