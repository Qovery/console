import { environmentFactoryMock } from '@console/domains/environment'
import { render } from '__tests__/utils/setup-jest'

import GeneralPage, { GeneralProps } from './general'

let props: GeneralProps

beforeEach(() => {
  props = {
    environments: environmentFactoryMock(2),
  }
})

describe('General', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GeneralPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
