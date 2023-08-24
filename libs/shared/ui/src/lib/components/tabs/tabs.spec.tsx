import { render } from '__tests__/utils/setup-jest'
import Icon from '../icon/icon'
import Tabs, { type TabsProps } from './tabs'

let props: TabsProps

beforeEach(() => {
  props = {
    items: [
      {
        name: 'Test',
        link: '/',
        icon: <Icon name="icon-solid-wheel" />,
      },
    ],
  }
})

describe('Tabs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tabs {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
