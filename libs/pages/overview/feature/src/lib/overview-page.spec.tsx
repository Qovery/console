import { render } from '@testing-library/react'

import PagesOverviewFeature from './overview-page'

describe('PagesOverviewFeature', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PagesOverviewFeature />)
    expect(baseElement).toBeTruthy()
  })
})
