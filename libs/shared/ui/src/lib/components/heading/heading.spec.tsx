import { renderWithProviders } from '@qovery/shared/util-tests'
import { Section } from '../section/section'
import { Heading } from './heading'

describe('Heading', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <Section>
        <Heading>Foobar</Heading>
      </Section>
    )
    expect(baseElement).toMatchSnapshot()
  })
})
