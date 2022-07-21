import { render } from '__tests__/utils/setup-jest'
import PageSettings from './page-settings'

describe('PageSettings', () => {
  const props = {
    links: [
      {
        title: 'General',
        icon: 'icon-solid-wheel',
        url: '/general',
      },
    ],
  }

  it('should render successfully', () => {
    const { baseElement } = render(
      <PageSettings links={props.links}>
        <p>hello</p>
      </PageSettings>
    )
    expect(baseElement).toBeTruthy()
  })
})
