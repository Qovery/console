import { renderWithProviders } from '@qovery/shared/util-tests'
import { Section } from './section'

describe('Section', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(<Section>Foobar</Section>)
    expect(baseElement).toMatchSnapshot()
  })
})
