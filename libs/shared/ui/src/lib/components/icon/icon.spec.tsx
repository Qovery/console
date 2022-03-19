import { render } from '__tests__/utils/setup-jest'
import { screen } from '@testing-library/react'

import Icon from './icon'
import { IconProps } from './icon'

describe('Icon', () => {
  let props: IconProps

  beforeEach(() => {
    props = {
      name: 'default',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = render(<Icon {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a font awesome icon as default', () => {
    render(<Icon {...props} />)

    expect(screen.getByRole('img')).toBeTruthy()
  })
})
