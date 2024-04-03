import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { InputSearch, type InputSearchProps } from './input-search'

const props: InputSearchProps = {
  data: ['my-value'],
  onChange: jest.fn(),
  placeholder: 'placeholder',
  value: 'my-value',
}
describe('InputSearch', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<InputSearch {...props} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should match with snapshot', async () => {
    const { baseElement, userEvent } = renderWithProviders(<InputSearch {...props} />)
    await userEvent.click(screen.getByRole('button'))
    expect(baseElement).toMatchSnapshot()
  })
})
