// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectFlattener(ob: any): { [key: string]: string } {
  const toReturn: { [key: string]: string } = {}

  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue

    if (typeof ob[i] == 'object' && ob[i] !== null) {
      const flatObject = objectFlattener(ob[i])
      for (const x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue

        // converting string to boolean or number if it's boolean or number
        try {
          toReturn[i + '.' + x] = JSON.parse(flatObject[x])
        } catch (e) {
          toReturn[i + '.' + x] = flatObject[x]
        }
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}
