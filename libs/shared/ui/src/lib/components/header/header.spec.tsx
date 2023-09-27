import { renderWithProviders } from '@qovery/shared/util-tests'
import { Section } from '../section/section'
import Header from './header'

describe('Header', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Section>
        <Header />
      </Section>
    )
    expect(baseElement).toBeTruthy()
  })
})
