import { type AnyService } from '@qovery/domains/services/data-access'
import { applicationFactoryMock, databaseFactoryMock } from '@qovery/shared/factories'
import { upperCaseFirstLetter } from '@qovery/shared/util-js'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import DraggableItem, { type DraggableItemProps } from './draggable-item'

const applications = applicationFactoryMock(1)
const databases = databaseFactoryMock(1)

describe('DraggableItem', () => {
  const props: DraggableItemProps = {
    // TODO: cast should be removed when all mock migrated to React Query types
    services: [...applications, ...databases] as AnyService[],
    serviceId: applications[0].id,
  }

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(<DraggableItem {...props} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render a application content', () => {
    const { getByText } = renderWithProviders(<DraggableItem {...props} />)

    expect(getByText(applications[0].name)).toBeInTheDocument()
  })

  it('should render a database content', () => {
    props.services = databases
    props.serviceId = databases[0].id
    renderWithProviders(<DraggableItem {...props} />)

    expect(screen.getByText(databases[0].name)).toBeInTheDocument()
    expect(screen.getByTestId('draggable-item-subtitle')).toHaveTextContent(
      `${upperCaseFirstLetter(databases[0].type)} - ${upperCaseFirstLetter(databases[0].mode)}`
    )
  })
})
