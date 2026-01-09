import { parse } from 'shell-quote'

/*
  Parse a command string into an array of arguments
  Back-end expects an array of arguments that's why we flatten the array
  Operator and comment are objects, we extract the 'op' and 'comment' properties
  
  `extractEnvVariables` is hack to display the env variables in the UI

  `shell-quote` library for more information:
  https://www.npmjs.com/package/shell-quote
*/
export const parseCmd = (cmd: string): string[] => {
  const placeholders: Record<string, string> = {}
  let i = 0

  // Replace all $(VAR_NAME) with placeholders
  // https://qovery.slack.com/archives/C02P2JB4SEM/p1746428425575539
  let cmdWithPlaceholders = cmd.replace(/\$\(([^)]+)\)/g, (_, varName) => {
    const placeholder = `__ENV_VAR_PLACEHOLDER_${i++}__`
    placeholders[placeholder] = `$(${varName})`
    return placeholder
  })

  // Replace all ${VAR_NAME} with placeholders to avoid shell-quote parsing errors
  cmdWithPlaceholders = cmdWithPlaceholders.replace(/\$\{([^}]*)\}/g, (match) => {
    const placeholder = `__ENV_VAR_PLACEHOLDER_${i++}__`
    placeholders[placeholder] = match
    return placeholder
  })

  // Extract $VAR variables for shell-quote env option
  const envVars = extractEnvVariables(cmd)

  try {
    // Parse with shell-quote (for proper splitting and $VAR support)
    const args = parse(cmdWithPlaceholders, envVars)

    // Restore placeholders
    return args.flatMap((arg) => {
      if (typeof arg === 'string') {
        return placeholders[arg] || arg
      }
      if ('op' in arg) {
        return arg.op
      }
      if ('comment' in arg) {
        return `#${arg.comment}`
      }
      return arg
    })
  } catch {
    // If parsing fails (e.g., malformed shell syntax), return command split by whitespace
    return cmd.split(/\s+/).filter(Boolean)
  }
}

function extractEnvVariables(inputString: string): { [key: string]: string } {
  const regex = /\$([a-zA-Z_][a-zA-Z0-9_-]*)/g
  const envObject: { [key: string]: string } = {}

  // Using matchAll to retrieve all matches
  ;[...inputString.matchAll(regex)].forEach((match) => {
    const varName = match[1] // variable name without the '$'
    envObject[varName] = `$${varName}`
  })

  return envObject
}

// Necessary to display args with quotes in the UI
export function joinArgsWithQuotes(args: string[]): string {
  return args
    .map((arg) => {
      if (arg.startsWith('#') && arg.split(' ').length > 1) {
        return arg
      }
      if (arg.split(' ').length > 1) {
        return `"${arg}"`
      }
      return arg
    })
    .join(' ')
}
