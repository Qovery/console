import { createElement } from 'react'
import { IntercomProvider } from 'react-use-intercom'
import { renderWithProviders } from '@qovery/shared/util-tests'
import Container, { type ContainerProps } from './container'

describe('Container', () => {
  let props: ContainerProps

  beforeEach(() => {
    props = {
      children: createElement('div'),
      params: {
        '*': 'some-value',
      },
      firstStep: true,
    }
  })

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <IntercomProvider appId="__test__app__id__" autoBoot={false}>
        <Container {...props} />
      </IntercomProvider>
    )
    expect(baseElement).toBeTruthy()
  })
})
