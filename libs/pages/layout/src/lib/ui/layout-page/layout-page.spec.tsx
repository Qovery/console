import { render } from '__tests__/utils/setup-jest'
import { createElement } from 'react'
import { userSignUpFactoryMock } from '@qovery/shared/factories'
import LayoutPage, { type LayoutPageProps } from './layout-page'

describe('LayoutPage', () => {
  let props: LayoutPageProps

  beforeEach(() => {
    props = {
      children: createElement('div'),
      user: userSignUpFactoryMock(),
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<LayoutPage {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
