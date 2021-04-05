let a = 100
let b = 100
c = 300
d = 500
let e = 500

const method1 = (welcome, name) => {
  console.log(`${welcome} ${name}`)
  const tt = () => {
    method2()
  }
  tt()
}
const method2 = () => {
  const a = 2
  console.log(a)
}
method1('欢迎', '小常')
method2()