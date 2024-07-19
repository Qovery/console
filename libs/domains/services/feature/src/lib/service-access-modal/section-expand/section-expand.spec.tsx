import { Accordion } from '@qovery/shared/ui'
import { renderWithProviders } from '@qovery/shared/util-tests'
import SectionExpand, { type SectionExpandProps } from './section-expand'

const props: SectionExpandProps = {
  title: 'my-title',
  description: 'description',
}

describe('SectionExpand', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(
      <Accordion.Root type="single">
        <SectionExpand {...props}>
          <div>content</div>
        </SectionExpand>
      </Accordion.Root>
    )
    expect(container).toMatchSnapshot()
  })
})
