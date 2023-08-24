import { DeploymentRestrictionModeEnum, DeploymentRestrictionTypeEnum } from 'qovery-typescript-axios'
import selectEvent from 'react-select-event'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import { CrudModalFeature } from './crud-modal-feature'

const createProps = {
  onClose: jest.fn(),
  onSubmit: jest.fn(),
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
  onSubmit: jest.fn(),
}

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

    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)
    expect(createProps.onSubmit).toHaveBeenCalledWith({
      mode: 'MATCH',
      type: 'PATH',
      value: 'baz',
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

    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)
    expect(editProps.onSubmit).toHaveBeenCalledWith({
      mode: 'MATCH',
      type: 'PATH',
      value: 'baz',
    })
  })
})
