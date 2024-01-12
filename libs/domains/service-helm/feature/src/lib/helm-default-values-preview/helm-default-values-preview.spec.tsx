import { renderWithProviders } from '@qovery/shared/util-tests'
import HelmDefaultValuesPreview from './helm-default-values-preview'

jest.mock('../hooks/use-helm-default-values/use-helm-default-values', () => {
  return {
    ...jest.requireActual('../hooks/use-helm-default-values/use-helm-default-values'),
    useHelmDefaultValues: () => ({
      data: 'my-yaml-content',
      isLoading: true,
    }),
  }
})

describe('HelmDefaultValuesPreview', () => {
  it('should match snapshot', async () => {
    const { baseElement } = renderWithProviders(<HelmDefaultValuesPreview />)
    expect(baseElement).toBeTruthy()
  })
})
