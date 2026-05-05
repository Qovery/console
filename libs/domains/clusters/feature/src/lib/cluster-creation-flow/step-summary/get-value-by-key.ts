export function getValueByKey(key: string, data: { [key: string]: string }[] = []): string[] {
  return data.reduce((result: string[], obj) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) result.push(obj[key])
    return result
  }, [])
}
