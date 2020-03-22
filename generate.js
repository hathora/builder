const yaml = require('js-yaml')
const fs   = require('fs')

const stringify = (key, value) => {
  if (Array.isArray(value)) {
    return `export enum ${key} {\n\t${value.join(',\n\t')}\n}`
  } else if (typeof value === 'object') {
    const parts = Object.entries(value).map(([k, v]) => `${k}: ${v}`)
    return `export interface ${key} {\n\t${parts.join('\n\t')}\n}`
  } else {
    return `export type ${key} = ${value}`
  }
}

const doc = yaml.safeLoad(fs.readFileSync('types.yml', 'utf8'))

console.log('export type UserId = string')
Object.entries(doc.types).forEach(([key, value]) => {
  console.log(stringify(key, value))
})
