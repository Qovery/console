import { renderWithProviders } from '@qovery/shared/util-tests'
import HelpSection, { type HelpSectionProps } from './help-section'

describe('HelpSection', () => {
  let props: HelpSectionProps

  beforeEach(() => {
    props = {
      description: 'Test description',
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<HelpSection {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should match snapshot', () => {
    const links = [
      {
        link: '#',
        linkLabel: 'How to configure my application',
      },
      {
        link: '#',
        linkLabel: 'How to delete my application',
      },
    ]
    const { baseElement } = renderWithProviders(<HelpSection links={links} {...props} />)
    expect(baseElement).toMatchSnapshot()
  })
})
