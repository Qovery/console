import { render } from '@testing-library/react'
import { wrapWithReactHookForm } from '../../../../../../../__tests__/utils/wrap-with-react-hook-form'
import PageSettingsAdvanced, { PageSettingsAdvancedProps } from './page-settings-advanced'

const props: PageSettingsAdvancedProps = {
  keys: ['key1', 'key2'],
  discardChanges: jest.fn(),
  onSubmit: jest.fn(),
  defaultAdvancedSettings: undefined,
  loading: 'loading',
  advancedSettings: undefined,
}

describe('PageSettingsAdvanced', () => {
  it('should render successfully', () => {
    const { baseElement } = render(wrapWithReactHookForm(<PageSettingsAdvanced {...props} />))
    expect(baseElement).toBeTruthy()
  })
})
