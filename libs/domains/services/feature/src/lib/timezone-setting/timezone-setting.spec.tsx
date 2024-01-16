import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders } from '@qovery/shared/util-tests'
import { TimezoneSetting } from './timezone-setting'

jest.mock('../hooks/use-list-timezone/use-list-timezone', () => ({
  useListTimezone: () => ({
    data: ['America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande'],
    isLoading: false,
  }),
}))

describe('TimezoneSetting', () => {
  it('should match snapshot', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<TimezoneSetting />))
    expect(baseElement).toMatchSnapshot()
  })
})
