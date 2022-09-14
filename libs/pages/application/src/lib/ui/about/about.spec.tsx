import { render } from '@testing-library/react'
import { ServiceTypeEnum } from '@qovery/shared/enums'
import About from './about'

describe('About', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <About
        link={{ link: '#', linkLabel: 'label', external: false }}
        description="A description"
        type={ServiceTypeEnum.APPLICATION}
      />
    )
    expect(baseElement).toBeTruthy()
  })
})
