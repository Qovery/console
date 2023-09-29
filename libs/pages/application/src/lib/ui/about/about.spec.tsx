import { render } from '__tests__/utils/setup-jest'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import About from './about'

describe('About', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<About description="A description" type={ServiceTypeEnum.APPLICATION} />)
    expect(baseElement).toBeTruthy()
  })
})
