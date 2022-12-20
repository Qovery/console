import { render } from '__tests__/utils/setup-jest'
import EnableBox, { EnableBoxProps } from './enable-box'

const props: EnableBoxProps = {
  checked: true,
  setChecked: jest.fn(),
  name: 'test',
  description: 'test',
  title: 'test',
  children: <div>test</div>,
}

describe('EnableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnableBox {...props} />)
    expect(baseElement).toBeTruthy()
  })
})
