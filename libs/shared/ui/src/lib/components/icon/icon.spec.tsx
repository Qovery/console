import { render } from '__mocks__/utils/test-utils'
import { IconEnum } from '../../enums/icon.enum'
import Icon from './icon'

describe('Icon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Icon name={IconEnum.GITHUB} />)
    expect(baseElement).toBeTruthy()
  })
})
