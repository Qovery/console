import PageGeneral, { PageGeneralProps } from './page-general'
import { render } from '__tests__/utils/setup-jest'

let props: PageGeneralProps

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
