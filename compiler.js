const DefineVariables = ['const', 'let', 'var']
// 箭头函数
const ArrowFunc = '=>'

// 生成tokens  词法分析，生成词素

function tokenizer(input) {
  let current = 0
  let tokens = []
  while(current < input.length) {
    let char = input[current]
    // 空格处理
    const spaceReg = /\s/
    if(spaceReg.test(char)) {
      current++
      continue
    }
    // 标识符处理
    const charReg = /[a-z]/i
    if(charReg.test(char)) {
      let value = ''
      const nomalizeReg = /[a-z]|[0-9]|\./i
      while(nomalizeReg.test(char)) {
        value += char
        char = input[++current]
      }
      let type
      if(value.includes('.')) {
        // 函数调用
        type = 'CallFunc'
      } else {
        // 区分是关键字还是变量命名
        type = DefineVariables.includes(value) ? 'DefineVariables' : 'Variables'
      }
      tokens.push({ type, value })
      continue
    }
    // 操作符处理
    const opeartorReg = /[\+\-\*/>=]/
    if(opeartorReg.test(char)) {
      let value = ''
      while(opeartorReg.test(char)) {
        value += char
        char = input[++current]
      }
      // 如果含有 '=>' 说明是箭头函数
      const type = value === ArrowFunc ? 'ArrowFunc' : 'Opeartor'
      tokens.push({ type, value })
      continue
    }
    // 处理参数
    if(char === '(') {
      let value = ''
      char = input[++current]
      while(char !== ')') {
        value += char
        char = input[++current]
      }
      char = input[++current]
      tokens.push({ type: 'Params', value })
      continue
    }
    // 处理代码块（也可以说是函数体）
    if(char === '{') {
      tokens.push({ type: 'Parent', value: '{' })
      current++
      continue
    }
    // 代码块闭合
    if(char === '}') {
      tokens.push({ type: 'Parent', value: '}' })
      current++
      continue
    }
    // 处理数字
    const numberReg = /[0-9]/
    if(numberReg.test(char)) {
      let value = ''
      while(numberReg.test(char)) {
        value += char
        char = input[++current]
      }
      tokens.push({ type: 'Number', value })
      current++
      continue
    }
    // 处理字符串
    if(char === '"') {
      let value = ''
      char = input[++current]
      while(char !== '"') {
        value += char
        char = input[++current]
      }
      char = input[++current]
      tokens.push({ type: 'String', value })
      current++
      continue
    }
  }
  return tokens
}
// 解析：生成ES6语法树 语法分析，生成抽象语法树
function parser(tokens) {
  const ast = {
    type: 'Program',
    body: []
  }
  let current = 0
  function walk() {
    let token = tokens[current]
    if(token.type === 'DefineVariables') {
      let node = tokens[current + 4]
      let expression 
      if(node &&  node.type === 'ArrowFunc') {
        // 箭头函数
        expression = {
          type: 'Function',
          identifier: token.value,
          name: tokens[++current].value,
          operator: tokens[++current].value,
          params: tokens[++current].value
        }
        current++
        current++
        expression.body = walk()
      } else {
        // 定义变量
        expression = {
          type: 'DefineVariables',
          identifier: token.value,
          name: tokens[++current].value,
          operator: tokens[++current].value,
          value: tokens[++current].value,
        }
        current++
      }
      return expression
    }
    if(token.type === 'Variables') {
      // 函数调用 method()
      if(tokens[current - 1].type !== 'DefineVariables' && tokens[current + 1].type === 'Params') {
        let expression = {
          type: 'CallFunc',
          value: token.value,
          params: tokens[++current].value
        }
        current++
        return expression
      }
      // 变量赋值 a = 1
      if(tokens[current - 1].type !== 'DefineVariables' && tokens[current + 1].type !== 'Params') {
        let expression = {
          type: 'Assignment',
          name: token.value,
          operator: tokens[++current].value,
          value: tokens[++current].value
        }
        current++
        return expression
      }
    }
    // 代码块
    if(token.type === 'Parent' && token.value === '{') {
      let expression = {
        type: 'CodeBlock',
        body: []
      }
      token = tokens[++current]
      while(token.type !== 'Parent' || token.type === 'Parent' && token.value !== '}') {
        expression.body.push(walk())
        token = tokens[current]
      }
      current++
      return expression.body
    }
    // 函数调用 console.log()
    if(token.type === 'CallFunc') {
      let expression = {
        type: 'CallFunc',
        value: token.value,
        params: tokens[++current].value
      }
      current++
      return expression
    }
    // 处理 数字、字符串、参数
    if(token.type === 'Number' || token.type === 'String' || token.type === 'Params') {
      current++
      return token
    }
  }
  while(current < tokens.length) {
    ast.body.push(walk())
  }
  return ast
}
// 遍历ES5 ast
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(node => {
      traverseNode(node, parent)
    })
  }
  function traverseNode(node, parent) {
    const method = visitor[node.type]
    if(method && method.enter) {
      method.enter(node, parent)
    }
    switch(node.type) {
      case 'Program':
        traverseArray(node.body, node)
        break
      case 'Function':
        traverseArray(node.body, node)
        break
    }
    if(method && method.exit) {
      method.exit(node, parent)
    }
  }
  traverseNode(ast, null)
}

// 转换：根据ES6 ast生成ES5 ast
function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: []
  }
  ast._es6 = newAst.body
  const visitor = {
    Function: {
      enter(node, parent) {
        const obj = {
          type: 'Function',
          name: node.name,
          params: node.params,
          body: []
        }
        node._es6 = obj.body
        parent._es6.push(obj)
      }
    },
    DefineVariables: {
      enter(node, parent) {
        const obj = {
          type: 'DefineVariables',
          name: node.name,
          value: node.value
        }
        parent._es6.push(obj)
      }
    },
    CallFunc: {
      enter(node, parent) {
        parent._es6.push({ ...node })
      }
    },
    Assignment: {
      enter(node, parent) {
        parent._es6.push({ ...node })
      }
    },
    String: {
      enter(node, parent) {
        parent._es6.push({ ...node })
      }
    },
    Number: {
      enter(node, parent) {
        parent._es6.push({ ...node })
      }
    }
  }
  traverser(ast, visitor)
  return newAst
}

// 代码生成：根据ES5ast生成ES5代码
function codeGenerator(node) {
  switch(node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n')
    case 'Function':
      return `
function ${node.name}(${node.params}) {
  ${node.body.map(codeGenerator).join('\n')}
}`
    case 'CallFunc':
      return `${node.value}(${node.params})`
    case 'DefineVariables':
      return `var ${node.name} = ${node.value}`
    case 'Assignment':
      return `${node.name} = ${node.value}`
    case 'Number':
      return node.value
    case 'String':
      return `"${node.value}"`
    default:
      throw new TypeError(node.type)
  }
}

// 编译
function compiler(input) {
  const tokens = tokenizer(input)
  const ast = parser(tokens)
  const newAst = transformer(ast)
  const output = codeGenerator(newAst)
  return output
}

module.exports = compiler
