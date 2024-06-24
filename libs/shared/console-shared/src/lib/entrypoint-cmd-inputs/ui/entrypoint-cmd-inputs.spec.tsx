import { wrapWithReactHookForm } from '__tests__/utils/wrap-with-react-hook-form'
import { renderWithProviders, screen } from '@qovery/shared/util-tests'
import EntrypointCmdInputs, { validateCmdArguments } from './entrypoint-cmd-inputs'

describe('EntrypointCmdInputs', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(wrapWithReactHookForm(<EntrypointCmdInputs />))
    screen.getByTestId('input-text-image-entry-point')
    screen.getByTestId('input-textarea-cmd-arguments')
    expect(baseElement).toBeTruthy()
  })

  describe('validateCmdArguments', () => {
    it('should return true when no value is provided', () => {
      expect(validateCmdArguments()).toBe(true)
    })

    it('should return true for various valid commands', () => {
      const validCommands = [
        'test -h 0.0.0.0',
        '-d --name=my-container -p 8080:80 nginx',
        '-d --name=my-container -h 192.168.1.1 -p 8080:80 nginx',
        '--rm -v /host/path:/container/path -e ENV_VAR=value --name my_container -p 8080:80 --network my_network nginx:latest',
        '-d --name=my-container -h 192.168.1.1 -p 8080:80 nginx_image',
        '--rm -v -e --name my_container -p 8080:80 --network my_network nginx:latest',
        '["test", "test2"]',
      ]

      validCommands.forEach((command) => {
        expect(validateCmdArguments(command)).toBe(true)
      })
    })

    describe('should return an error message for invalid commands', () => {
      it('with invalid redirection character', () => {
        const invalidCommand = '--name my_container > output.log'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: >')
      })

      it('with invalid special character', () => {
        const invalidCommand = '--name my_container & nginx'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: &')
      })

      it('with invalid comment character', () => {
        const invalidCommand = '--name my_container # this is a comment'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: #')
      })

      it('with invalid command substitution character', () => {
        const invalidCommand = '--name my_container `ls`'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: `ls`')
      })

      it('with invalid command table character', () => {
        const invalidCommand = '--name my_container "]'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: "]')
      })

      it('with invalid JSON format', () => {
        const invalidCommand = '["test", "test2'
        expect(validateCmdArguments(invalidCommand)).toBe('Please enter a valid command. Invalid argument: ["test",')
      })
    })
  })
})
