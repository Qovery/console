import { renderWithProviders } from '@qovery/shared/util-tests'
import Indicator, { type IndicatorProps } from './indicator'

const props: IndicatorProps = {
  content: <div className="h-3 w-3 rounded-full bg-red-500" />,
}

describe('Indicator', () => {
  it('should match snapshot top end', () => {
    const { baseElement } = renderWithProviders(
      <Indicator side="top" align="end" {...props}>
        <button>Button</button>
      </Indicator>
    )
    expect(baseElement).toMatchSnapshot()
  })
  it('should match snapshot bottom end', () => {
    const { baseElement } = renderWithProviders(
      <Indicator side="bottom" align="end" {...props}>
        <button>Button</button>
      </Indicator>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
