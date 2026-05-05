import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { DatabaseAccessibilityEnum, DatabaseModeEnum } from 'qovery-typescript-axios'
import { databaseFactoryMock } from '@qovery/shared/factories'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { DatabaseGeneralSettings } from './database-general-settings'

jest.mock('@qovery/domains/organizations/feature', () => ({
  AnnotationSetting: () => null,
  LabelSetting: () => null,
}))

jest.mock('@qovery/domains/services/feature', () => ({
  GeneralSetting: () => null,
}))

describe('DatabaseGeneralSettings', () => {
  const database = databaseFactoryMock(1, DatabaseModeEnum.CONTAINER)[0]

  it('should render main sections', () => {
    renderWithProviders(
      wrapWithReactHookForm(<DatabaseGeneralSettings database={database} databaseVersionOptions={[]} />, {
        defaultValues: {
          name: database.name,
          type: database.type,
          mode: database.mode,
          accessibility: DatabaseAccessibilityEnum.PRIVATE,
          version: database.version,
        },
      })
    )

    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Extra labels/annotations')).toBeInTheDocument()
  })
})
