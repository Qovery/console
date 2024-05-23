import { render } from '__tests__/utils/setup-jest'
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
