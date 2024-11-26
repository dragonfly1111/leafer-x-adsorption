# Leafer-x-adsorption

Leafer边距吸附、间距吸附插件

## show

![cover](https://github.com/dragonfly1111/leafer-x-adsorption/blob/main/public/image/demo.png?raw=true)

## 运行

```sh
npm run start # 开始运行项目

npm run build # 打包插件代码，同时会创建types

npm run test # 自动化测试
```

## 在线demo
[点击体验](https://dragonfly1111.github.io/)

## usage

### install

```shell
npm i leafer-x-adsorption  
```

### use
```js
import { App } from 'leafer-ui'
import { ReferenceLine } from 'leafer-x-adsorption'

const app = new App({
  view: window,
  tree: {},
  editor: {},
})
const referenceLine = new ReferenceLine(app, {
  showGutter: true,
  showBg: true,
  fill: 'rgb(0,208,255)',
  fontSize: 12,
  gutterAdsorption: 4,
  showGutterNum: 3,
  gutterArr: [24, 48, 72]
}, {
  showLine: true,
  showLineNum: 2,
  stroke: 'rgb(0,208,255)',
  strokeWidth: 1,
  adsorption: 5
})

// 关闭边距吸附
referenceLine.changeLineStatus(false)
// 关闭间距吸附
referenceLine.changeGutterStatus(false)
```

## 构造函数
```ts
// 第一个参数为用户的leafer app对象
// 第二个参数是间距吸附属性(可选)
// 第三个参数为边距吸附属性(可选)
constructor(app: App, gutterOptions?: GutterOptions, lineOptions?: LineOptions) {}
```
## 内置属性
<table>
<thead>
  <th>属性</th>
  <th>说明</th>
  <th>类型</th>
  <th>示例值</th>
  <th>默认</th>
</thead>
<tr>
  <td>gutterOptions</td>
  <td>间距吸附属性</td>
  <td><a href='#GutterOptions'>gutterOptions</a></td>
  <td>-</td>
  <td>-</td>
</tr>
<tr>
  <td>lineOptions</td>
  <td>边距吸附属性</td>
  <td><a href='#LineOptions'>LineOptions</a></td>
  <td>-</td>
  <td>-</td>
</tr>
</table>

## 内置方法
<table>
<thead>
  <th>方法</th>
  <th>说明</th>
  <th>参数类型</th>
  <th>示例值</th>
</thead>
<tr>
  <td>changeLineStatus</td>
  <td>切换开启边距吸附状态</td>
  <td>(boolean)</td>
  <td>true</td>
</tr>
<tr>
  <td>changeGutterStatus</td>
  <td>切换开启间距吸附状态</td>
  <td>(boolean)</td>
  <td>true</td>
</tr>
</table>

#### LineOptions
```ts
export interface LineOptions {
  showLine?: boolean // 是否开启边距吸附 默认开启
  showLineNum?: number // 吸附检索数量(对齐线的最大展示数量) 默认5
  stroke?: string // 对齐线颜色 默认rgb(255,0,0)
  strokeWidth?: number // 线粗细 默认1(px)
  adsorption?: number // 吸附像素范围 小于这个数字就会被吸附 默认10(px)
}
```

#### GutterOptions
```ts
export interface GutterOptions {
  showGutter?: boolean // 是否开启间距吸附 默认开启
  showGutterNum?: number // 吸附检索数量(间距线的最大展示数量) 默认5
  fill?: string // 标记文字颜色 默认rgb(255,0,0)
  fontSize?: number // 标记文字大小 默认12(px)
  stroke?: string // 箭头颜色
  strokeWidth?: number // 箭头粗细
  startArrow?: IArrowType // 开始箭头样式
  endArrow?: IArrowType // 结束箭头样式
  gutterAdsorption?: number // 吸附像素范围 默认6(px)
  gutterArr?: number[] // 提示间距数组 默认 [12, 32, 64, 128] 间距在数组之内则会进行间距吸附
  showBg?: boolean // 是否展示间距背景 默认开启
  bgColor?: string // 间距背景颜色 默认rgba(255,156,156,0.16)
}
```
