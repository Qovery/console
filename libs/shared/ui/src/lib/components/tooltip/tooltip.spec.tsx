import { renderWithProviders } from '@qovery/shared/util-tests'
import Tooltip, { type TooltipProps } from './tooltip'

const props: TooltipProps = {
  content: <p>hello</p>,
}

describe('Tooltip', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<Tooltip {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
