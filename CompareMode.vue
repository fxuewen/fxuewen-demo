  <template>
  <div class="stamp-merge-tool-wrap" v-loading="loading" :element-loading-text="loadingText"  @mousemove="(e)=>handleGlobalMousemove(e)" @mouseup="handleGlobalMouseup">
    <div class="tool-wrap-inner">
      <div class="opreration-area" style="position:relative" @contextmenu.prevent="markType=''">
        <el-row class="img-compare-mark" @mousedown.native="cancelSelect">
          <el-col :span="12" class="left">
            <div
              ref="destContainer"
              :imgUrl="destImgUrl"
              :class="['img-container', {selected: params.dest.select}]"
              :style="{'background-image': `url(${destImgUrl})`,'background-size': '100% 100%', transform: `rotate(${params.dest.rotate}deg)`}"
              @mousedown.stop="(e)=>handleMosedown(e, 'dest')"
              @mousemove="(e)=>handleMousemove(e, 'dest')"
              @mouseleave="(e)=>handleMouseleave(e, 'dest')"
              @mouseup="(e)=>handleMouseup(e, 'dest')"
            >
              <svg id="destSvg" @click="handleClick"></svg>
              <canvas v-if="markType" ref="destCanvas"></canvas>
              <div ref="destRotate" v-show="params.dest.select && !markType" class="rotate-control-wrap">
                <div class="rotate-box">
                  <div class="rotate-control" @mousedown="(e)=>handleStartRotate(e, 'dest')"></div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12" class="right">
            <div
              ref="sampleContainer"
              :imgUrl="sampleImgUrl"
              :class="['img-container', {selected: params.sample.select}]"
              :style="{'background-image': `url(${sampleImgUrl})`,'background-size': '100% 100%',transform: `rotate(${params.sample.rotate}deg)`}"
              @mousedown.stop="(e)=>handleMosedown(e, 'sample')"
              @mousemove="(e)=>handleMousemove(e, 'sample')"
              @mouseleave="(e)=>handleMouseleave(e, 'sample')"
              @mouseup="(e)=>handleMouseup(e, 'sample')"
            >
              <svg id="sampleSvg" @click="handleClick"></svg>
              <canvas v-if="markType" ref="sampleCanvas"></canvas>
              <div ref="sampleRotate" v-show="params.sample.select && !markType" class="rotate-control-wrap">
                <div class="rotate-box">
                  <div class="rotate-control" @mousedown="(e)=>handleStartRotate(e, 'sample')"></div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="config-area">
        <ul class="nav">
          <li class="active">编辑模式</li>
          <li @click="$emit('mode-change', 'clip')">截图模式</li>
        </ul>
        <div class="config-container">
          <div class="config-item">
            <h3>比对模式</h3>
            <div class="btns-wrap">
              <span
                style="margin-right:10px;"
                class="select-btn"
                :class="{ selected: params.dest.original}"
                @click="setImgMode(true)"
                >原图</span
              >
              <span class="select-btn" :class="{ selected: !params.dest.original}" @click="setImgMode(false)">提取图</span>
            </div>
          </div>
          <div class="config-item">
            <h3>显示方式</h3>
            <div class="btns-wrap">
              <span class="select-btn selected" style="margin-right:10px;"  @click="$emit('mode-change', 'compare')">比对显示</span>
              <span class="select-btn" @click="$emit('mode-change', 'edit')">重叠显示</span>
            </div>
          </div>
          <div class="config-item">
            <h3>对象</h3>
            <div class="btns-wrap">
              <span class="select-btn" style="margin-right:10px;" :class="{ selected: params.dest.select }" @click="selectTarget('dest')">检材</span>
              <span class="select-btn" :class="{ selected: params.sample.select }" @click="selectTarget('sample')">样本</span>
            </div>
          </div>
          <div class="config-item">
            <h3>是否变色</h3>
            <div class="btns-wrap">
              <span
                style="margin-right:10px;"
                class="select-btn"
                :class="{ selected: currentElement && currentElement.convertColor }"
                @click="convertColor(true)"
                >是</span
              >
              <span
                class="select-btn"
                :class="{ selected: !currentElement || !currentElement.convertColor }"
                @click="convertColor(false)"
                >否</span
              >
            </div>
          </div>
          <div class="config-item">
            <h3>旋转角度</h3>
            <div class="btns-wrap">
              <el-input-number
                v-model="rotate"
                controls-position="right"
                size="small"
                :min="-2000"
                :max="2000"
                :disabled="currentElement ? false : true"
                @change="handleRotateChange"
                @blur="handleRotateChange"
              ></el-input-number>
            </div>
          </div>
          <div class="config-item">
            <h3>标记箭头</h3>
            <div class="btns-wrap mark-btn">
              <i :class="['el-icon-top-right', {select: markType === 'arrow'}]" @click="enterArrowMarkAction"></i>
            </div>
          </div>
          <div class="config-item">
            <h3>显示标尺</h3>
            <div class="btns-wrap mark-btn">
              <el-switch :value="currentElement && currentElement.ruler" active-color="#42a0f8" inactive-color="#e8e8e8" @change="handleShowRule"></el-switch>
            </div>
          </div>
          <div class="config-item">
            <h3>间距测量</h3>
            <div class="btns-wrap mark-btn">
              <i :class="['iconfont iconcolumn-width', {select: markType === 'dis'}]" @click="enterDisMarkAction"></i>
            </div>
          </div>
        </div>
        <div class="submit-btn-wrap">
          <button @click="saveResult">保存</button>
        </div>
      </div>
    </div>
    <v-contextmenu ref="contextmenu" @contextmenu.native.prevent>
      <v-contextmenu-item @click="handleDelete">删除</v-contextmenu-item>
    </v-contextmenu>
  </div>
</template>
<script>
import Snap from 'snapsvg'
import { genUuid } from '@/api/caseHandle/caseHandle'
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      loadingText: '',
      // 旋转角度
      rotate: 0,
      markType: '',
      // 箭头标记
      arrows: [],
      // 距离标记
      disArr: [],
      startPoint: null,
      currentPath: null,
      // 旋转的对象（dest or sample）
      rotatingType: '',
      currentElement: null,
      // 保存参数
      params: {
        dest: {
          type: 'dest',
          arrows: [],
          circles: [],
          convertColor: false,
          original: false,
          ruler: false,
          spaces: [],
          select: true,
          rotate: 0
        },
        sample: {
          type: 'sample',
          arrows: [],
          circles: [],
          convertColor: false,
          original: false,
          ruler: false,
          spaces: [],
          select: false,
          rotate: 0
        }
      }
    }
  },
  computed: {
    destImgUrl() {
      if (this.params.dest.ruler) {
        if (this.params.dest.convertColor) {
          return this.params.dest.original ? this.data.dest.convertedRulerFile : this.data.dest.convertedDenoisedRulerFile
        }
        return this.params.dest.original ? this.data.dest.rulerFile : this.data.dest.denoisedRulerFile
      }

      if (this.params.dest.convertColor) {
        return this.params.dest.original ? this.data.dest.convertedFile : this.data.dest.covertedFetchedFile
      }

      return this.params.dest.original ? this.data.dest.originSealFile : this.data.dest.fetchedSealFile
    },
    sampleImgUrl() {
      if (this.params.sample.ruler) {
        if (this.params.sample.convertColor) {
          return this.params.sample.original ? this.data.sample.convertedRulerFile : this.data.sample.convertedDenoisedRulerFile
        }
        return this.params.sample.original ? this.data.sample.rulerFile : this.data.sample.denoisedRulerFile
      }

      if (this.params.sample.convertColor) {
        return this.params.sample.original ? this.data.sample.convertedFile : this.data.sample.covertedFetchedFile
      }
      return this.params.sample.original ? this.data.sample.originSealFile : this.data.sample.fetchedSealFile
    }
  },
  activated() {
    this.initGraph()
  },
  deactivated() {
    this.resetParams()
  },
  watch: {
    destImgUrl: function(newVal, oldVal) {
      this.initView(this.destImgUrl, 'dest')
    },
    sampleImgUrl: function(newVal, oldVal) {
      this.initView(this.sampleImgUrl, 'sample')
    }
  },
  methods: {
    async initGraph() {
      await this.getSaveParams()
      this.initView(this.destImgUrl, 'dest')
      this.initView(this.sampleImgUrl, 'sample')
    },
    destroyGraph() {},
    // 重置参数
    resetParams() {
      // 旋转角度
      this.rotate = 0
      this.markType = ''
      this.startPoint = null
      this.currentPath = null
      this.currentElement = null
      // 旋转的对象（dest or sample）
      this.rotatingType = ''
      this.arrows = []
      // 距离标记
      this.disArr = []
      this.params = {
        dest: {
          type: 'dest',
          arrows: [],
          circles: [],
          convertColor: false,
          original: false,
          ruler: false,
          spaces: [],
          select: true,
          rotate: 0
        },
        sample: {
          type: 'sample',
          arrows: [],
          circles: [],
          convertColor: false,
          original: false,
          ruler: false,
          spaces: [],
          select: false,
          rotate: 0
        }
      }
    },
    initView(imgUrl, type) {
      const el = this.$refs[`${type}Container`]
      const w = el.parentNode.clientWidth
      const h = el.parentNode.clientHeight
      const d = Math.min(w, h)
      let img = new Image()
      img.src = imgUrl

      const loadComplete = () => {
        const scale = d / Math.sqrt(Math.pow(img.width, 2) + Math.pow(img.height, 2))
        el.style.width = img.width * scale + 'px'
        el.style.height = img.height * scale + 'px'
        el.originWidth = img.width

        let svgStr = ` <svg  width="100%" height="100%" version="1.1"
          xmlns="http://www.w3.org/2000/svg">

          <rect width="${img.width * scale}"  height="${img.height * scale}"
          style="fill: transparent;stroke-width:2;
          stroke:rgb(24,144,255);stroke-dasharray: 2 4;opacity: 0.5" />
          <line x1="0" y1="0" x2="${img.width * scale}" y2="${img.height * scale}"
          style="stroke:rgb(24,144,255);stroke-width:2; stroke-dasharray: 2 4;opacity: 0.5 "/>
          <line x2="0" y2="${img.height * scale}" x1="${img.width * scale}" y1="0"
          style="stroke:rgb(24,144,255);stroke-width:2;stroke-dasharray: 2 4;opacity: 0.5"/>

          </svg>`
        const base64Url = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgStr)))}`
        el.childNodes[2].style['background-image'] = `url('${base64Url}')`
        this.renderMarks(type)
      }

      if (img.complete) {
        loadComplete()
      }
      img.onload = () => {
        loadComplete()
      }
    },
    // 获取对比参数
    async getSaveParams() {
      this.loading = true
      await this.$request({
        url: '/api/v1/seal/compare/doing/data',
        method: 'get',
        params: {
          destSliceId: this.data.dest.sliceId,
          sampleSliceId: this.data.sample.sliceId
        }
      }).then(res => {
        this.loading = false
        if (res.data.status === 200) {
          this.params = res.data.data
          this.$set(this.params.dest, 'type', 'dest')
          this.$set(this.params.dest, 'select', true)
          this.$set(this.params.sample, 'type', 'sample')
          this.$set(this.params.sample, 'select', false)
          this.currentElement = this.params.dest
          this.rotate = this.params.dest.rotate
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 取消选中
    cancelSelect() {
      this.rotate = 0
      this.currentElement = null
      this.params.dest.select = false
      this.params.sample.select = false
    },
    // 开始旋转
    handleStartRotate(e, type) {
      this.rotatingType = type
    },
    handleGlobalMousemove(e) {
      if (!this.rotatingType) {
        return
      }
      const rotateControlWrap = this.$refs[`${this.rotatingType}Rotate`]
      const boxBoundingClientRect = rotateControlWrap.getBoundingClientRect()
      const x = boxBoundingClientRect.left + boxBoundingClientRect.width / 2
      const y = boxBoundingClientRect.top + boxBoundingClientRect.height / 2
      const rad = Math.atan2(e.pageX - x, e.pageY - y)
      const rot = ((rad * (180 / Math.PI) * -1) + 180) % 360 // 逆时针旋转了180
      this.params[`${this.rotatingType}`].rotate = rot
      this.rotate = rot
    },
    handleGlobalMouseup(e) {
      this.rotatingType = ''
      // 标记绘制鼠标松开处理
      this.handleMouseup(e)
    },
    // 鼠标按下
    handleMosedown(e, currentType) {
      this.selectTarget(currentType)
      if (this.markType) {
        this.startPoint = {
          x: e.offsetX,
          y: e.offsetY
        }
      }
    },
    // 鼠标在图像上移动
    handleMousemove(e, currentType) {
      if (!this.startPoint || !this.currentElement) {
        return
      }

      const dis = Math.sqrt(Math.pow(e.offsetX - this.startPoint.x, 2) + Math.pow(e.offsetY - this.startPoint.y, 2))
      if (dis < 4) {
        return
      }

      const type = this.currentElement.type
      if (currentType !== type) {
        return
      }

      const canvas = this.$refs[`${type}Canvas`]
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#FF0000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(this.startPoint.x, this.startPoint.y)
      ctx.lineTo(e.offsetX, e.offsetY)
      ctx.stroke()
      ctx.closePath()
    },
    handleMouseleave(e, currentType) {},
    // 鼠标松开
    handleMouseup(e, currentType) {
      if (!this.startPoint || !this.markType) {
        return
      }

      const type = this.currentElement.type
      const dis = Math.sqrt(Math.pow(e.offsetX - this.startPoint.x, 2) + Math.pow(e.offsetY - this.startPoint.y, 2))
      if (currentType && currentType === type && dis > 4) {
        if (this.markType === 'arrow') {
          this.drawArrowMark(this.startPoint, { x: e.offsetX, y: e.offsetY })
        } else {
          this.drawDisMark(this.startPoint, { x: e.offsetX, y: e.offsetY })
        }
      }

      this.clearCanvas(type)
      this.startPoint = null
    },
    handleClick(e) {},
    // 绘制标记
    renderMarks(type) {
      this.arrows = []
      this.disArr = []
      // 绘制箭头
      const container = this.$refs[`${type}Container`]
      const originWidth = container.originWidth
      const scale = container.clientWidth / originWidth
      const s = Snap(`#${type}Svg`)
      if (!s) {
        return
      }
      s.clear()
      this.params[type].arrows.forEach(arrow => {
        const uuid = genUuid()
        arrow.uuid = uuid
        const point1 = {
          x: arrow.topX * scale,
          y: arrow.topY * scale
        }
        const point2 = {
          x: arrow.textX * scale,
          y: arrow.textY * scale
        }
        this.drawArrowMark(point1, point2, type, uuid)
      })
      // 绘制间距
      this.params[type].spaces.forEach(space => {
        const uuid = genUuid()
        space.uuid = uuid
        const point1 = {
          x: space.topX * scale,
          y: space.topY * scale
        }
        const point2 = {
          x: space.textX * scale,
          y: space.textY * scale
        }
        this.drawDisMark(point1, point2, type, uuid)
      })
    },
    // 清空画布
    clearCanvas(type) {
      const canvas = this.$refs[`${type}Canvas`]
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, width, height)
    },
    // 获取箭头路径
    getArrowPath(point1, point2, point, direction) {
      const par = 10
      const slopy = Math.atan2((point1.y - point2.y), (point1.x - point2.x))
      const cosy = Math.cos(slopy)
      const siny = Math.sin(slopy)
      let path1, path2
      if (direction === 'to') {
        // to
        path1 = `M${point.x} ${point.y}L${point.x + par * cosy + par / 2 * siny} ${point.y + par * siny - par / 2 * cosy}`
        path2 = `M${point.x} ${point.y}L${point.x + par * cosy - par / 2 * siny} ${point.y + par * siny + par / 2 * cosy}`
      } else {
        // from
        path1 = `M${point.x} ${point.y}L${point.x - par * cosy + par / 2 * siny} ${point.y - par * siny - par / 2 * cosy}`
        path2 = `M${point.x} ${point.y}L${point.x - par * cosy - par / 2 * siny} ${point.y - par * siny + par / 2 * cosy}`
      }

      return `${path1}${path2}`
    },
    // 绘制箭头
    drawArrowMark(point1, point2, renderType, uuid) {
      const type = renderType || this.currentElement.type
      const s = Snap(`#${type}Svg`)
      const fromPath = this.getArrowPath(point1, point2, point1, 'from')
      const path = s.path(`M${point1.x} ${point1.y}L${point2.x} ${point2.y} ${fromPath}Z`)
      path.attr({
        stroke: 'red',
        strokeWidth: 2,
        cursor: 'pointer'
      })

      const container = this.$refs[`${type}Container`]
      const originWidth = container.originWidth
      const scale = container.clientWidth / originWidth
      const that = this
      path.mousedown((e) => {
        e.preventDefault()
        if (e.button === 2) {
          this.currentPath = path
          const menu = that.$refs.contextmenu
          menu.show({ left: e.clientX, top: e.clientY })
        }
      })

      path.originType = type
      path.originPos = {
        topX: point1.x / scale,
        topY: point1.y / scale,
        textX: point2.x / scale,
        textY: point2.y / scale,
        uuid: uuid || genUuid()
      }
      this.arrows.push(path)
      !renderType && this.params[type].arrows.push(path.originPos)
    },
    // 绘制间距
    drawDisMark(point1, point2, renderType, uuid) {
      const type = renderType || this.currentElement.type
      const s = Snap(`#${type}Svg`)
      const container = this.$refs[`${type}Container`]
      const originWidth = container.originWidth
      const scale = container.clientWidth / originWidth
      const size = 15
      let point3, point4, point5, point6
      const slopy = Math.atan2((point1.y - point2.y), (point1.x - point2.x))
      const cosy = Math.cos(slopy)
      const siny = Math.sin(slopy)
      if (point1.x < point2.x) {
        point3 = {
          x: point1.x + size * siny,
          y: point1.y - size * cosy
        }
        point4 = {
          x: point2.x + size * siny,
          y: point2.y - size * cosy
        }
        point5 = {
          x: point1.x - size * siny,
          y: point1.y + size * cosy
        }
        point6 = {
          x: point2.x - size * siny,
          y: point2.y + size * cosy
        }
      } else {
        point3 = {
          x: point1.x - size * siny,
          y: point1.y + size * cosy
        }
        point4 = {
          x: point2.x - size * siny,
          y: point2.y + size * cosy
        }
        point5 = {
          x: point1.x + size * siny,
          y: point1.y - size * cosy
        }
        point6 = {
          x: point2.x + size * siny,
          y: point2.y - size * cosy
        }
      }

      const g = s.g()
      // 间距形状
      const line1 = `M${point1.x} ${point1.y} L${point2.x} ${point2.y}`
      const fromArrow = this.getArrowPath(point1, point2, point1, 'from')
      const toArrow = this.getArrowPath(point1, point2, point2, 'to')
      const line2 = `M${point3.x} ${point3.y} L${point4.x} ${point4.y}`
      const line3 = `M${point3.x} ${point3.y} L${point5.x} ${point5.y}`
      const line4 = `M${point4.x} ${point4.y} L${point6.x} ${point6.y}`
      const path = s.path(`${line1}${fromArrow}${toArrow}${line2}${line3}${line4}Z`)
      g.add(path)
      path.attr({
        stroke: 'red',
        strokeWidth: 2
      })
      // 文字所在线
      const timestamp = new Date().getTime()
      let textPath
      const offsetY = -4
      if (point1.x < point2.x) {
        textPath = Snap.parse(`<path id="${timestamp}" d="M ${point1.x + offsetY * siny},${point1.y - offsetY * cosy} L${point2.x + offsetY * siny},${point2.y - offsetY * cosy}" style="display:none;"/>`)
      } else {
        textPath = Snap.parse(`<path id="${timestamp}" d="M ${point2.x - offsetY * siny},${point2.y + offsetY * cosy} L${point1.x - offsetY * siny},${point1.y + offsetY * cosy}" style="display:none;"/>`)
      }
      g.add(textPath)
      // 文字
      const dis = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)) / scale
      let text = dis * 2.54 / this.data[type].dpi
      text = text.toFixed(1)
      var textShape = Snap.parse(`
        <text x="0" y="0" stroke="red" text-anchor="middle" style="font-size:12pt;text-anchor: middle;">
          <textPath xlink:href="#${timestamp}" startOffset="50%" >${text}cm</textPath>
        </text>
      `)
      g.add(textShape)

      g.attr({
        cursor: 'pointer'
      })
      const that = this
      g.mousedown((e) => {
        e.preventDefault()
        if (e.button === 2) {
          this.currentPath = g
          const menu = that.$refs.contextmenu
          menu.show({ left: e.clientX, top: e.clientY })
        }
      })

      g.originType = type
      g.originPos = {
        topX: point1.x / scale,
        topY: point1.y / scale,
        textX: point2.x / scale,
        textY: point2.y / scale,
        lineTopX: point3.x / scale,
        lineTopY: point3.y / scale,
        lineTextX: point4.x / scale,
        lineTextY: point4.y / scale,
        uuid: uuid || genUuid()
      }
      this.disArr.push(g)
      !renderType && this.params[type].spaces.push(g.originPos)
    },
    // 删除标记
    handleDelete() {
      if (!this.currentPath) {
        return
      }

      // 删除箭头
      const index1 = this.params[this.currentPath.originType].arrows.findIndex(item => item.uuid === this.currentPath.originPos.uuid)
      index1 > -1 && this.params[this.currentPath.originType].arrows.splice(index1, 1)
      // 删除间距
      const index2 = this.params[this.currentPath.originType].spaces.findIndex(item => item.uuid === this.currentPath.originPos.uuid)
      index2 > -1 && this.params[this.currentPath.originType].spaces.splice(index2, 1)
      // 删除标记
      this.currentPath && this.currentPath.remove()
    },
    // 选择要操作的对象
    selectTarget(type) {
      this.params.dest.select = false
      this.params.sample.select = false
      this.params[type].select = true
      this.rotate = this.params[type].rotate || 0
      this.currentElement = this.params[type]
    },
    // 设置图片模式
    setImgMode(mode) {
      if (this.params.dest.original === mode) {
        return
      }

      this.params.dest.original = mode
      this.params.sample.original = mode
    },
    // 旋转
    handleRotateChange() {
      this.currentElement.rotate = this.rotate
    },
    // 显示标尺
    handleShowRule() {
      if (!this.currentElement) {
        this.$message({
          type: 'warning',
          message: '未选中对象'
        })
        return
      }

      this.currentElement.ruler = !this.currentElement.ruler
      const imgUrl = this.currentElement.type === 'dest' ? this.destImgUrl : this.sampleImgUrl

      if (!this.currentElement.ruler || imgUrl) {
        return
      }

      this.loading = true
      const url = this.data.compareType === 1 ? '/api/v1/seal/compare/addRuler' : '/api/v1/print/slice/compare/addRuler'
      this.$request({
        url: url,
        method: 'get',
        params: {
          infoId: this.data[this.currentElement.type].infoId,
          sliceId: this.data[this.currentElement.type].sliceId
        }
      })
        .then(res => {
          this.loading = false
          if (res.data.status === 200) {
            const data = res.data.data
            if (this.currentElement.type === 'dest') {
              this.data.dest.rulerFile = data.fileRulerFullPath
              this.data.dest.denoisedRulerFile = data.denoisedRulerFileFullPath
              this.data.dest.convertedRulerFile = data.convertedRulerFileFullPath
              this.data.dest.convertedDenoisedRulerFile = data.convertedDenoisedRulerFileFullPath
            } else {
              this.data.sample.rulerFile = data.fileRulerFullPath
              this.data.sample.denoisedRulerFile = data.denoisedRulerFileFullPath
              this.data.sample.convertedRulerFile = data.convertedRulerFileFullPath
              this.data.sample.convertedDenoisedRulerFile = data.convertedDenoisedRulerFileFullPath
            }
          } else {
            this.$message({
              type: 'warning',
              message: res.data.message
            })
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    convertColor(convertColor) {
      if (!this.currentElement) {
        this.$message({
          type: 'warning',
          message: '未选中对象'
        })
        return
      }
      this.currentElement.convertColor = convertColor
      const imgUrl = this.currentElement.type === 'dest' ? this.destImgUrl : this.sampleImgUrl
      if (convertColor && !imgUrl) {
        const url = this.data.compareType === 1 ? '/api/v1/seal/compare/convert' : '/api/v1/print/slice/compare/convert'
        const id = this.currentElement.type === 'dest' ? this.data.dest.sliceId : this.data.sample.sliceId
        this.loading = true
        this.$request({
          method: 'get',
          url: `${url}?id=${id}`
        })
          .then(res => {
            this.loading = false
            if (res.data.status === 200) {
              if (this.currentElement.type === 'dest') {
                this.data.dest.convertedFile = res.data.data.convertedFileFullPath
                this.data.dest.covertedFetchedFile = res.data.data.convertedDenoisedFileFullPath
              } else {
                this.data.sample.convertedFile = res.data.data.convertedFileFullPath
                this.data.sample.covertedFetchedFile = res.data.data.convertedDenoisedFileFullPath
              }
            } else {
              this.$message({
                type: 'warning',
                message: res.data.message
              })
            }
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    // 绘制箭头模式
    enterArrowMarkAction() {
      if (this.markType !== 'arrow') {
        this.markType = 'arrow'
      } else {
        this.markType = ''
      }
    },
    // 绘制间距模式
    enterDisMarkAction() {
      if (this.markType !== 'dis') {
        this.markType = 'dis'
      } else {
        this.markType = ''
      }
    },
    // 保存结果
    saveResult() {
      this.loading = true
      this.loadingText = '图片处理耗时较长，请耐心等待...'
      const params = Object.assign({}, this.params)
      params.dest.sliceId = this.data.dest.sliceId
      params.dest.imgUrl = this.destImgUrl
      params.sample.sliceId = this.data.sample.sliceId
      params.sample.imgUrl = this.sampleImgUrl
      this.$request({
        url: '/api/v1/seal/slice/drawSlicePicSave',
        method: 'post',
        data: params
      }).then(res => {
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang='scss' scoped>
.img-compare-mark {
  position: relative;
  width:100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #fff;

    .left {
      position: relative;
      height: 100%;
      border-right: 1px solid #e8e8e8;
      overflow: hidden;
      background-color: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .right {
      position: relative;
      height: 100%;
      overflow: hidden;
      background-color: #f0f2f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .img-container {
      position: relative;
      width: 100%;
      height: 100%;
      border: 2px solid #e8e8e8;
      overflow: hidden;

      &.selected {
        border: 2px solid #42a0f8;
      }

      svg {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }

      canvas {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      }

       // 旋转控制按钮所在图层
    .rotate-control-wrap{
      position:absolute;
      width: 100%;
      height:100%;
      display:flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;

      .rotate-box {
        position: absolute;
        background-color: rgba(24,144,255,0.5);
        border-radius: 24px;
        border: 1px dashed rgb(24,144,255);
        width: 24px;
        height: 24px;
        left: calc(50% - 12px);
        top: calc(50% - 12px);
      }

      .rotate-control{
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #1890ff;
        position: absolute;
        top: -120px;
        left: 50%;
        margin-left: -6px;
        cursor: all-scroll;
        pointer-events: auto;

        &:before{
          width: 0;
          height: 114px;
          border: 2px dashed #1890ff;
          position: absolute;
          content: '';
          left: 5px;
          top: 4px;

        }
      }
    }
    }
}
</style>
