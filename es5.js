var a = 100
var b = 100
c = 300
d = 500
var e = 500

function method1(welcome, name) {
  console.log(`${welcome} ${name}`)

  function tt() {
    method2()
  }
  tt()
}

function method2() {
  var a = 2
console.log(a)
}
method1('欢迎', '小常')
method2()