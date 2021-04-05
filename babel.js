const fs = require('fs')
const compiler = require('./compiler.js')

const input = fs.readFileSync('./es6.js', 'utf8')

const output = compiler(input)

try {
  fs.writeFileSync('./es5.js', output)
} catch (err) {
  console.error(err)
}
