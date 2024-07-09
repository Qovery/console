import { renderWithProviders } from '@qovery/shared/util-tests'
import SectionExpand, { SectionExpandProps } from './section-expand'

const props: SectionExpandProps = {
  title: 'my-title',
  description: 'description',
}

describe('SectionExpand', () => {
  it('should match snapshot', async () => {
    const { container } = renderWithProviders(
      <SectionExpand {...props}>
        <div>content</div>
      </SectionExpand>
    )
    expect(container).toMatchSnapshot()
  })
})
