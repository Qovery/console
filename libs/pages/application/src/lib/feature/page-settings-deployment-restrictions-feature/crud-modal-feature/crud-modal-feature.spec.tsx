import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { useCreateDeploymentRestriction, useEditDeploymentRestriction } from '@qovery/domains/services/feature'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModalFeature } from './crud-modal-feature'

const createProps = {
  onClose: jest.fn(),
  serviceId: '1',
  serviceType: 'APPLICATION' as const,
}

const editProps = {
  deploymentRestriction: {
    id: '3',
    created_at: '2022-07-21T09:59:41.999006Z',
    mode: DeploymentRestrictionModeEnum.EXCLUDE,
    type: DeploymentRestrictionTypeEnum.PATH,
    value: 'foobar',
  },
  onClose: jest.fn(),
  serviceId: '1',
  serviceType: 'APPLICATION' as const,
}

jest.mock('@qovery/domains/services/feature', () => {
  const mutate1 = jest.fn()
  const mutate2 = jest.fn()
  return {
    ...jest.requireActual('@qovery/domains/services/feature'),
    useCreateDeploymentRestriction: () => ({
      mutate: mutate1,
    }),
    useEditDeploymentRestriction: () => ({
      mutate: mutate2,
    }),
  }
})

describe('CrudModalFeature', () => {
  it('should create deployment restriction', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...createProps} />)

    const submitButton = await screen.findByRole('button', { name: /create/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    const mode = screen.getByLabelText('Mode')
    await selectEvent.select(mode, ['MATCH'], {
      container: document.body,
    })

    await userEvent.clear(screen.getByLabelText('Value'))
    await userEvent.type(screen.getByLabelText('Value'), 'baz')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)
    expect(useCreateDeploymentRestriction().mutate).toHaveBeenCalledWith({
      payload: {
        mode: 'MATCH',
        type: 'PATH',
        value: 'baz',
      },
      serviceId: '1',
      serviceType: 'APPLICATION',
    })
  })

  it('should edit deployment restriction', async () => {
    const { userEvent } = renderWithProviders(<CrudModalFeature {...editProps} />)

    const submitButton = await screen.findByRole('button', { name: /confirm/i })
    // https://react-hook-form.com/advanced-usage#TransformandParse
    expect(submitButton).toBeInTheDocument()

    const mode = screen.getByLabelText('Mode')
    await selectEvent.select(mode, ['MATCH'], {
      container: document.body,
    })

    // Keep the same type

    await userEvent.clear(screen.getByLabelText('Value'))
    await userEvent.type(screen.getByLabelText('Value'), 'baz')

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)
    expect(useEditDeploymentRestriction().mutate).toHaveBeenCalledWith({
      payload: {
        mode: 'MATCH',
        type: 'PATH',
        value: 'baz',
      },
      deploymentRestrictionId: '3',
      serviceId: '1',
      serviceType: 'APPLICATION',
    })
  })
})
