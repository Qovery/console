import { render } from '__tests__/utils/setup-jest'
import PageGeneral, { type PageGeneralProps } from './page-general'

let props: PageGeneralProps

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PageGeneral {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
