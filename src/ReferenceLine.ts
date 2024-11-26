// import { ICanvasContext2D } from '@leafer-ui/interface'
import { App, DragEvent, Leafer, Line, Text, Rect, ZoomEvent } from '@leafer-ui/core'
import { IBoundsData } from '@leafer/interface'
import { IArrowType, ILeaf, ILeafer, IPointData } from 'leafer-ui'
import { Arrow } from '@leafer-in/arrow'

enum Position {
  LEFT = 'left', // 左左交汇
  RIGHT = 'right', // 右右交汇处
  TOP = 'top', // 上上交汇
  BOTTOM = 'bottom', // 下下交汇
  CENTER_X = 'centerX', // 中心x交汇
  CENTER_Y = 'centerY', // 中心y交汇

  LEFT_OVERLAP = 'leftOverlap', // 左（当前）右（其他）交汇
  RIGHT_OVERLAP = 'rightOverlap', // 右（当前）左（其他）交汇
  TOP_OVERLAP = 'topOverlap',  // 下（当前）上（其他）交汇
  BOTTOM_OVERLAP = 'bottomOverlap', // 上（当前）下（其他）交汇

  TARGET_CENTER_Y_TOP = 'targetCenterYTop', // 中心x（当前）上（其他）交汇
  TARGET_CENTER_Y_BOTTOM = 'targetCenterYBottom', // 中心x（当前）上（其他）交汇
  TARGET_CENTER_X_LEFT = 'targetCenterXLeft', // 中心y（当前）左（其他）交汇
  TARGET_CENTER_X_RIGHT = 'targetCenterXRight', // 中心y（当前）右（其他）交汇
}

enum GutterPosition {
  LEFT = 'l2r', // 左-右
  RIGHT = 'r2l', // 右-左
  TOP = 't2b', // 上-下
  BOTTOM = 'b2t', // 下-上
}

const DEFAULT_COLOR = 'rgb(255,0,0)'
const DEFAULT_GUTTER_NUM = 5 // 默认间距吸附检索数量(间距)
const DEFAULT_LINE_NUM = 5 // 默认间距吸附检索数量(边距)
const DEFAULT_FONT_SIZE = 12 // 默认字体大小
const DEFAULT_GUTTER_STOCK_WIDTH = 2 // 默认线宽(间距)
const DEFAULT_LINE_STOCK_WIDTH = 1 // 默认线宽(边距)
const DEFAULT_GUTTER_ADS = 6 // 默认吸附像素范围(间距)
const DEFAULT_LINE_ADS = 10 // 默认吸附像素范围(边距)
const DEFAULT_BG_COLOR = 'rgba(255,156,156,0.16)'

export interface GutterOptions {
  showGutter?: boolean // 是否开启间距吸附
  showGutterNum?: number // 吸附检索数量
  fill?: string // 标记文字颜色
  fontSize?: number // 标记文字大小
  stroke?: string // 箭头颜色
  strokeWidth?: number // 箭头粗细
  startArrow?: IArrowType // 开始箭头样式
  endArrow?: IArrowType // 结束箭头样式
  gutterAdsorption?: number // 吸附像素范围-间距
  gutterArr?: number[] // 提示间距arr
  showBg?: boolean // 是否展示间距背景
  bgColor?: string // 间距背景颜色
}

export interface LineOptions {
  showLine?: boolean // 是否开启边距吸附
  showLineNum?: number // 吸附检索数量
  stroke?: string // 箭头颜色
  strokeWidth?: number // 线粗细
  adsorption?: number // 吸附像素范围-对齐
}

export interface PointObj {
  x: number // 左边界
  y: number // 上边界
  centerX: number // 中心x
  centerY: number // 中心y
  x1: number // 右边界
  y1: number // 下边界
}

export interface ArrowObj {
  gutter: number, // 当前标记间距
  position: string, // 箭头关系
  x: number // 左边界
  y: number // 上边界
  x1?: number // 右边界
  y1?: number // 下边界
  type: string // 箭头类型
}

export class ReferenceLine {
  private app: App
  // private scale: number
  private pointMap: Map<number, PointObj>
  private line: Line
  private gutterOptions: GutterOptions
  private lineOptions: LineOptions
  private readonly referenceLeafer: Leafer
  // private readonly contextContainer: ICanvasContext2D

  constructor(app: App, gutterOptions?: GutterOptions, lineOptions?: LineOptions) {
    this.app = app
    // this.scale = 1
    this.referenceLeafer = app.addLeafer()
    this.gutterOptions = {
      showGutter: gutterOptions.hasOwnProperty("showGutter") ? gutterOptions.showGutter : true,
      showGutterNum: gutterOptions.showGutterNum || DEFAULT_GUTTER_NUM,
      fill: gutterOptions.fill || DEFAULT_COLOR,
      fontSize: gutterOptions.fontSize || DEFAULT_FONT_SIZE,
      stroke: gutterOptions.stroke || DEFAULT_COLOR,
      strokeWidth: gutterOptions.strokeWidth || DEFAULT_GUTTER_STOCK_WIDTH,
      startArrow: gutterOptions.startArrow || 'mark',
      endArrow: gutterOptions.endArrow || 'mark',
      gutterAdsorption: gutterOptions.gutterAdsorption || DEFAULT_GUTTER_ADS,
      gutterArr: gutterOptions.gutterArr || [12, 32, 64, 128],
      showBg: gutterOptions.hasOwnProperty("showBg") ? gutterOptions.showBg : true,
      bgColor: gutterOptions.bgColor || DEFAULT_BG_COLOR,
    }
    this.lineOptions = {
      showLine: lineOptions.hasOwnProperty("showLine") ? lineOptions.showLine : true,
      showLineNum: lineOptions.showLineNum || DEFAULT_LINE_NUM,
      adsorption: lineOptions.adsorption || DEFAULT_LINE_ADS,
      stroke: lineOptions.stroke || DEFAULT_COLOR,
      strokeWidth: lineOptions.strokeWidth || DEFAULT_LINE_STOCK_WIDTH,
    }
    // this.contextContainer = this.referenceLeafer.canvas.context
    this.pointMap = new Map()
    this.zoomHandler = this.zoomHandler.bind(this)
    this.app.tree.on(ZoomEvent.ZOOM, this.zoomHandler)
    this.treeListen(app.tree)
    this.initCenterMap()
    // this.ADSORPTION_RANGE = ADSORPTION_RANGE
  }

  private initCenterMap() {
    this.app.tree.children.forEach(item => {
      const bounds: PointObj = this.getPoints(item.getBounds('content', 'page'))
      this.pointMap.set(item.innerId, bounds)
    })
  }

  // 获取元素中心点
  private getPoints(bounds: IBoundsData) {
    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2
    // 找到中心点 并且绘制十字线
    return {
      centerX,
      centerY,
      x: bounds.x,
      y: bounds.y,
      x1: bounds.x + bounds.width,
      y1: bounds.y + bounds.height
    }
  }
  // 计算旋转元素的x偏移量
  private getXOffset(bounds: IPointData[]) {
    const minX = Math.min(...bounds.map(point => point.x));
    return bounds[0].x - minX
  }
  // 计算旋转元素的y偏移量
  private getYOffset(bounds: IPointData[]) {
    const minY = Math.min(...bounds.map(point => point.y));
    return bounds[0].y - minY
  }
  // 计算旋转元素的x偏移量
  private getXOffset1(bounds: IPointData[]) {
    const maxX = Math.max(...bounds.map(point => point.x));
    return maxX - bounds[0].x
  }
  // 计算旋转元素的y偏移量
  private getYOffset1(bounds: IPointData[]) {
    const maxY = Math.max(...bounds.map(point => point.y));
    return maxY - bounds[0].y
  }

  // 绘制参考线
  private drawLine(type: string, num: number, position: string, target: ILeaf) {
    const bounds = this.getPoints(target.getBounds('content', 'page'))
    const xOffset = this.getXOffset(target.getLayoutPoints('content', 'page'))
    const yOffset = this.getYOffset(target.getLayoutPoints('content', 'page'))
    if (type === 'row') {
      // 绘制横辅助线
      this.line = new Line({
        x: -10000,
        y: num,
        width: 20000,
        strokeWidth: this.lineOptions.strokeWidth,
        stroke: this.lineOptions.stroke,
      })
      switch (position) {
        case Position.TOP:
        case Position.BOTTOM_OVERLAP:
          target.y = num+ yOffset
          break
        case Position.BOTTOM:
        case Position.TOP_OVERLAP:
          target.y = num - (bounds.y1 - bounds.y)+ yOffset
          break
        case Position.CENTER_Y:
        case Position.TARGET_CENTER_Y_TOP:
        case Position.TARGET_CENTER_Y_BOTTOM:
          target.y = num - (bounds.y1 - bounds.y) / 2 + yOffset
          break
      }
    } else {
      // 绘制纵辅助线
      this.line = new Line({
        x: num,
        y: -10000,
        width: 20000,
        rotation: 90,
        strokeWidth: 1,
        stroke: this.lineOptions.stroke
      })
      switch (position) {
        case Position.CENTER_X:
        case Position.TARGET_CENTER_X_LEFT:
        case Position.TARGET_CENTER_X_RIGHT:
          target.x = num - (bounds.x1 - bounds.x) / 2 + xOffset
          break
        case Position.LEFT:
        case Position.LEFT_OVERLAP:
          target.x = num + xOffset
          break
        case Position.RIGHT:
        case Position.RIGHT_OVERLAP:
          target.x = num - (bounds.x1 - bounds.x) + xOffset
          break
      }
    }
    this.referenceLeafer.add(this.line)
  }

  // 绘制间距线
  private drawArrow(obj: ArrowObj, target: ILeaf) {
    const xOffset = this.getXOffset(target.getLayoutPoints('content', 'page'))
    const yOffset = this.getYOffset(target.getLayoutPoints('content', 'page'))
    const xOffset1 = this.getXOffset1(target.getLayoutPoints('content', 'page'))
    const yOffset1 = this.getYOffset1(target.getLayoutPoints('content', 'page'))
    let arrow, text, reactObj
    if (obj.type === 'row') {
      arrow = new Arrow({
        x: obj.x,
        y: obj.y,
        width: obj.gutter,
        strokeWidth: this.gutterOptions.strokeWidth,
        startArrow: this.gutterOptions.startArrow,
        endArrow: this.gutterOptions.endArrow,
        stroke: this.gutterOptions.stroke,
      })
      if (obj.position === GutterPosition.LEFT) {
        // target.x = obj.x - target.width
        target.x = obj.x - xOffset1
      } else {
        target.x = obj.x + obj.gutter + xOffset
      }
      text = new Text({
        x: obj.x + obj.gutter / 2,
        y: obj.y,
        fill: this.gutterOptions.fill,
        fontSize: this.gutterOptions.fontSize,
        textAlign: 'center',
        text: obj.gutter.toString()
      })
      reactObj = {
        width: obj.gutter,
        height: 20000,
        y: -10000,
        x: obj.x,
        fill: this.gutterOptions.bgColor,
        zIndex: -1
      }
    } else if (obj.type === 'vertical') {
      arrow = new Arrow({
        x: obj.x,
        y: obj.y,
        width: obj.gutter,
        rotation: 90,
        strokeWidth: this.gutterOptions.strokeWidth,
        startArrow: this.gutterOptions.startArrow,
        endArrow: this.gutterOptions.endArrow,
        stroke: this.gutterOptions.stroke,
      })
      if (obj.position === GutterPosition.TOP) {
        target.y = obj.y - yOffset1
      } else {
        target.y = obj.y + obj.gutter + yOffset
      }
      text = new Text({
        x: obj.x + this.gutterOptions.fontSize,
        y: obj.y + obj.gutter / 2 - (this.gutterOptions.fontSize * 1.5) / 2,
        fill: this.gutterOptions.fill,
        fontSize: this.gutterOptions.fontSize,
        textAlign: 'center',
        text: obj.gutter.toString()
      })
      reactObj = {
        width: 20000,
        x: -10000,
        height: obj.gutter,
        y: obj.y,
        fill: this.gutterOptions.bgColor,
        zIndex: -1
      }
    }
    this.referenceLeafer.add(arrow)
    if(text) {
      this.referenceLeafer.add(text)
    }
    // 绘制间距背景
    if(this.gutterOptions.showBg) {
      const rect = new Rect(reactObj)
      this.referenceLeafer.add(rect)
    }
  }

  // 从pointMap中找到与目标元素中心距离最小的n个元素
  private getCloseEle(n: number, target: ILeaf, targetBounds: PointObj) {
    let closestPoints: PointObj[] = []
    const closestPointsTmp: PointObj[] = []
    const distances: { point: PointObj, distance: number }[] = [];
    // 找到中心距离最近的 gutterOptions.showGutterNum 个元素
    this.pointMap.forEach((point, id) => {
      if (id !== target.innerId) {
        const distance = Math.sqrt(Math.pow(point.centerX - targetBounds.centerX, 2) + Math.pow(point.centerY - targetBounds.centerY, 2));
        distances.push({ point, distance });
      }
    });
    distances.sort((a, b) => a.distance - b.distance);
    for (let i = 0; i < Math.min(n, distances.length); i++) {
      closestPointsTmp.push(distances[i].point);
    }
    closestPoints = closestPointsTmp
    console.log('closestPoints')
    console.log(closestPoints)
    return closestPoints
  }

  // 监听tree的拖拽事件
  private treeListen(leafer: ILeafer) {
    leafer.on(DragEvent.DRAG, (e: DragEvent) => {
      this.referenceLeafer.clear()
      if(this.lineOptions.showLine) {
        this.calcOverlap(e.target)
      }
      if(this.gutterOptions.showGutter) {
        this.calcGutter(e.target)
      }
    })
    leafer.on(DragEvent.END, () => {
      this.referenceLeafer.clear()
      this.initCenterMap()
    })
  }

  // 计算当前操作元素 与 centerMap中坐标（x、y、center）是否有重叠
  private calcOverlap(target: ILeaf) {
    const targetBounds: PointObj = this.getPoints(target.getBounds('content', 'page'))
    const overlapPoints: { type: string; value: number; position: string; }[] = []
    const closestPoints = this.getCloseEle(this.lineOptions.showLineNum, target, targetBounds)

    closestPoints.forEach((point, id) => {
      if (id !== target.innerId) {
        // 检查左边界
        if (Math.abs(point.x - targetBounds.x) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x,
            position: Position.LEFT
          })
        }
        // 检查右边界
        if (Math.abs(point.x1 - targetBounds.x1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x1,
            position: Position.RIGHT
          })
        }
        // 检查上边界
        if (Math.abs(point.y - targetBounds.y) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y,
            position: Position.TOP
          })
        }
        // 检查下边界
        if (Math.abs(point.y1 - targetBounds.y1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y1,
            position: Position.BOTTOM
          })
        }
        // 检查中心X
        if (Math.abs(point.centerX - targetBounds.centerX) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.centerX,
            position: Position.CENTER_X
          })
        }
        // 检查中心Y
        if (Math.abs(point.centerY - targetBounds.centerY) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.centerY,
            position: Position.CENTER_Y
          })
        }

        // 检查右边界与其他元素左边界的重叠
        if (Math.abs(point.x - targetBounds.x1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x,
            position: Position.RIGHT_OVERLAP
          })
        }
        // 检查左边界与其他元素右边界的重叠
        if (Math.abs(point.x1 - targetBounds.x) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x1,
            position: Position.LEFT_OVERLAP
          })
        }
        // 检查上边界与其他元素下边界的重叠
        if (Math.abs(point.y - targetBounds.y1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y,
            position: Position.TOP_OVERLAP
          })
        }
        // 检查下边界与其他元素上边界的重叠
        if (Math.abs(point.y1 - targetBounds.y) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y1,
            position: Position.BOTTOM_OVERLAP
          })
        }
        // todo 还差 当前top和其他center  left和其他center的情况

        // 检查target的中心Y与point的上边界的重叠
        if (Math.abs(targetBounds.centerY - point.y) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y,
            position: Position.TARGET_CENTER_Y_TOP
          })
        }
        // 检查target的中心Y与point的下边界的重叠
        if (Math.abs(targetBounds.centerY - point.y1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'row',
            value: point.y1,
            position: Position.TARGET_CENTER_Y_BOTTOM
          })
        }
        // 检查target的中心X与其他元素的左边界的重叠
        if (Math.abs(targetBounds.centerX - point.x) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x,
            position: Position.TARGET_CENTER_X_LEFT
          })
        }
        // 检查target的中心X与其他元素的右边界的重叠
        if (Math.abs(targetBounds.centerX - point.x1) <= this.lineOptions.adsorption) {
          overlapPoints.push({
            type: 'vertical',
            value: point.x1,
            position: Position.TARGET_CENTER_X_RIGHT
          })
        }
      }
    })
    overlapPoints.forEach(item => {
      this.drawLine(item.type, item.value, item.position, target)
    })
  }

  // 计算元素间距
  private calcGutter(target: ILeaf) {
    // this.referenceLeafer.clear()
    const overlapPoints: ArrowObj[] = []
    const targetBounds: PointObj = this.getPoints(target.getBounds('content', 'page'))
    const closestPoints = this.getCloseEle(this.gutterOptions.showGutterNum, target, targetBounds)

    closestPoints.forEach((point, id) => {
      if (id !== target.innerId) {
        this.gutterOptions.gutterArr.forEach(gutter => {
          // 检查左右间距
          // 当前在左 其他在右
          if (Math.abs(point.x - targetBounds.x1 - gutter) <= this.gutterOptions.gutterAdsorption) {
            overlapPoints.push({
              gutter,
              position: GutterPosition.LEFT,
              type: 'row',
              x: point.x - gutter,
              y: targetBounds.centerY
            })
          }
          // 当前在右 其他在左
          if (Math.abs(targetBounds.x - point.x1 - gutter) <= this.gutterOptions.gutterAdsorption) {
            overlapPoints.push({
              gutter,
              position: GutterPosition.RIGHT,
              type: 'row',
              x: point.x1,
              y: targetBounds.centerY
            })
          }
          // 检查上下间距
          // 当前在上 其他在下
          if (Math.abs(point.y - targetBounds.y1 - gutter) <= this.gutterOptions.gutterAdsorption) {
            overlapPoints.push({
              gutter,
              position: GutterPosition.TOP,
              type: 'vertical',
              x: targetBounds.centerX,
              y: point.y - gutter
            })
          }
          // 当前在下 其他在上
          if (Math.abs(targetBounds.y - point.y1 - gutter) <= this.gutterOptions.gutterAdsorption) {
            overlapPoints.push({
              gutter,
              position: GutterPosition.BOTTOM,
              type: 'vertical',
              x: targetBounds.centerX,
              y: point.y1
            })
          }
        })
      }
    })
    overlapPoints.forEach(item => {
      this.drawArrow(item, target)
    })
  }

  private zoomHandler() {
    // this.scale = e.scale
    // // 缩放之后需要同步调整间距尺寸
    // this.gutterOptions.fontSize *= this.scale
    // this.gutterOptions.gutterAdsorption *= this.scale
    // this.gutterOptions.gutterArr = this.gutterOptions.gutterArr.map(item => item * this.scale)
    // this.lineOptions.adsorption *= this.scale
    this.initCenterMap()
  }

  // 切换间距吸附状态
  public changeGutterStatus(val: boolean) {
    this.gutterOptions.showGutter = val
  }

  // 切换边距吸附状态
  public changeLineStatus(val: boolean) {
    this.lineOptions.showLine = val
  }

  // 处理元素有旋转时的吸附偏移量
  // private getOffset(target: ILeaf) {
  //   if(target.rotation % 360 === 0) {
  //     return target.height / 2
  //   } else {
  //     return
  //   }
  // }
}
