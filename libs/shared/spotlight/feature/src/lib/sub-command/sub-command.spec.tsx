import { renderWithProviders } from '@qovery/shared/util-tests'
import { SubCommand } from './sub-command'

describe('SubCommand', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn()
  })
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <SubCommand
        organizationId="000"
        open={true}
        inputRef={{ current: null }}
        listRef={{ current: null }}
        resetSelection={jest.fn()}
        setOpen={jest.fn()}
        service={{
          id: '00',
          name: 'service',
        }}
      />
    )

    expect(baseElement).toHaveTextContent('Arrow to navigate')
    expect(baseElement).toHaveTextContent('Enter to open')
    expect(baseElement).toHaveTextContent('Actions')
    expect(baseElement).toHaveTextContent('Service')
    expect(baseElement).toHaveTextContent('Go to project')
    expect(baseElement).toHaveTextContent('Go to environment')
    expect(baseElement).toHaveTextContent('Add to favorites')
  })
})
