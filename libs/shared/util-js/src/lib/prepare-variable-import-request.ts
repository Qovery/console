import { type VariableImportRequest } from 'qovery-typescript-axios'
import { P, match } from 'ts-pattern'
import { type VariableData } from '@qovery/shared/interfaces'

export function prepareVariableImportRequest(variables: VariableData[]): VariableImportRequest | null {
  if (!variables.length) {
    return null
  }

  return {
    overwrite: true,
    vars: variables
      .map(({ variable: name = '', scope, value = '', isSecret: is_secret }) =>
        match(scope)
          .with(P.nullish, () => undefined)
          .otherwise((currentScope) => ({ name, scope: currentScope, value, is_secret }))
      )
      .filter((variable) => !!variable),
  }
}

export default prepareVariableImportRequest
