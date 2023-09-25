import { render } from '__tests__/utils/setup-jest'
import { Section } from '../section/section'
import Header from './header'

describe('Header', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Section>
        <Header />
      </Section>
    )
    expect(baseElement).toBeTruthy()
  })
})
