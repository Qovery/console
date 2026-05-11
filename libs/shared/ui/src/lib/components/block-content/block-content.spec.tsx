import { render } from '@qovery/shared/util-tests'
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
