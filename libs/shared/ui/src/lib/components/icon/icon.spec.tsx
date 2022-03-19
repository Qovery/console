import { render } from '__tests__/utils/setup-jest'
import { IconEnum } from '../../enums/icon.enum'
import Icon from './icon'

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon name={IconEnum.GITHUB} />)
    expect(baseElement).toBeTruthy()
  })
})
