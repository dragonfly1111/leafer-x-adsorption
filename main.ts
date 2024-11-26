import { App, Ellipse, Rect, Star } from 'leafer-ui'
import '@leafer-in/editor' // 导入图形编辑器插件
import { ReferenceLine } from './src' // 引入插件代码


const app = new App({
  view: window,
  ground: { type: 'draw' },
  tree: {},
  editor: {},
  sky: { type: 'draw' }
})
// const rect = new Rect({
//   x: 100,
//   y: 100,
//   width: 100,
//   height: 100,
//   fill: getRandomColor(),
//   editable: true,
//   rotation: 290
// })
const rect1 = new Ellipse({
  x: 200,
  y: 200,
  width: 200,
  height: 200,
  fill: getRandomColor(),
  editable: true,
  rotation: 45
})
const star = new Star({
  width: 100,
  height: 100,
  corners: 3,
  innerRadius: 0.15,
  editable: true,
  fill: 'rgb(50,205,121)'
})
// app.tree.add(rect)
app.tree.add(rect1)
app.tree.add(star)


for (let i = 0; i < 3; i++) {
  const randomNumber = () => {
    return Math.random() * (300 - 50) + 50
  }
  const rect = new Rect({
    x: randomNumber(),
    y: randomNumber(),
    width: randomNumber(),
    height: randomNumber(),
    fill: getRandomColor(),
    editable: true,
    rotation: Math.random() * 960
  })
  // const polygon = new Polygon({
  //   width: randomNumber(),
  //   height: randomNumber(),
  //   sides: 6,
  //   cornerRadius: 10,
  //   fill: 'rgb(50,205,121)',
  //   editable: true
  // })

  app.tree.add(rect)
  // app.tree.add(polygon)
}



// 生成随机颜色
function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const referenceLine = new ReferenceLine(app, {
  showGutter: false,
  showBg: true,
  fill: 'rgb(0,208,255)',
  fontSize: 12,
  gutterAdsorption: 4,
  showGutterNum: 3,
  gutterArr: [24, 48, 72]
}, {
  showLine: false,
  showLineNum: 2,
  stroke: 'rgb(0,208,255)',
  strokeWidth: 1,
  adsorption: 5
})

referenceLine.changeLineStatus(true)
referenceLine.changeGutterStatus(true)

console.log(referenceLine)
