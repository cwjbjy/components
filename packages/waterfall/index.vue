<template>
  <div
    class="vue-waterfall-container"
    :style="{
      width: width && !isMobile ? width + 'px' : '',
      height: height + 'px',
    }"
  >
    <div
      class="loading ball-beat"
      v-show="isPreloading"
      :class="{ first: isFirstLoad }"
    >
      <div
        class="dot"
        v-for="(item, index) in loadingDotCount"
        :key="index"
      ></div>
    </div>
    <div class="vue-waterfall-scroll" ref="scrollEl">
      <div
        class="img-box"
        v-for="(item, index) in imgsArr_c"
        :key="index"
        :class="['default-card-animation', { __err__: item._error }]"
        :style="{
          padding: gap_c / 2 + 'px',
          width: colWidth + 'px',
        }"
        @click="
          handleClickImage($event, {
            value: item,
            index: index,
          })
        "
      >
        <div class="cardStyle">
          <div
            v-if="item[srcKey]"
            class="img-inner-box"
            :style="{
              width: imgWidth_c + 'px',
              height: item._height ? item._height + 'px' : false,
            }"
          >
            <img :src="item[srcKey]" />
          </div>
          <div class="img-box-footer" v-if="hasFooterSlot">
            <slot name="footer" :data="item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isMobile } from "./util";
export default {
  name: "wj-waterfall",
  props: {
    width: {
      //PC端，容器的宽和图片的宽需自定义，否则容器的宽为100%,图片宽为240
      type: Number,
    },
    height: {
      // 容器高度
      type: Number,
    },
    loadingDotCount: {
      // loading 点数
      type: Number,
      default: 3,
    },
    srcKey: {
      type: String,
      default: "src",
    },
    imgWidth: {
      type: Number,
      default: 240,
    },
    gap: {
      type: Number,
      default: 20,
    },
    mobileGap: {
      type: Number,
      default: 20,
    },
    imgsArr: {
      type: Array,
      required: true,
    },
    enablePullDownEvent: {
      type: Boolean,
      default: false,
    },
    reachBottomDistance: {
      // 滚动触底距离，触发加载新图片
      type: Number, // selector
      default: 20, // 默认在最低那一列到底时触发
    },
  },
  data() {
    return {
      isMobile: false,
      isPreloading: true, // 正在预加载中，显示加载动画
      imgsArr_c: [], // 待图片预加载imgsArr完成，插入新的字段height之后,才会生成imgsArr_c，这时才开始渲染
      cols: NaN, // 列数
      loadedCount: 0, //大于此值为新增图片
      isFirstLoad: true, // 首次加载
      imgBoxEls: null, //所有的.img-box元素
      beginIndex: 0, // 大于此值为要新排列的图片
      colsHeightArr: [],
    };
  },
  computed: {
    hasFooterSlot() {
      return !!this.$scopedSlots.footer;
    },
    imgWidth_c() {
      return this.isMobile ? window.innerWidth / 2 - this.gap_c : this.imgWidth;
    },
    gap_c() {
      return this.isMobile ? this.mobileGap : this.gap;
    },
    // 每一列的宽度
    colWidth() {
      return this.imgWidth_c + this.gap_c;
    },
  },
  watch: {
    imgsArr() {
      this.preload();
    },
  },
  methods: {
    preload() {
      this.imgsArr.forEach((imgItem, imgIndex) => {
        if (imgIndex < this.loadedCount) return; // 只对新加载图片进行预加载
        if (!imgItem[this.srcKey]) {
          this.imgsArr[imgIndex]._height = "0";
          this.loadedCount++;
          console.log("没有图片地址", imgItem);
          // 支持无图模式
          if (this.loadedCount == this.imgsArr.length) {
            this.preloaded();
          }
          return;
        }
        let oImg = new Image();
        oImg.src = imgItem[this.srcKey];
        oImg.onload = oImg.onerror = (e) => {
          this.loadedCount++;

          // 预加载图片，计算图片容器的高
          this.imgsArr[imgIndex]._height =
            e.type == "load"
              ? Math.round(this.imgWidth_c * (oImg.height / oImg.width))
              : this.imgWidth_c;

          if (e.type == "error") {
            this.imgsArr[imgIndex]._error = true;
            console.log("图片加载失败", this.imgsArr[imgIndex]);
          }
          if (this.loadedCount === this.imgsArr.length) {
            this.preloaded();
          }
        };
      });
    },
    preloaded() {
      this.isFirstLoad = false;
      // 预加载完成，这时才开始渲染
      this.imgsArr_c = this.imgsArr.concat([]);
      this.$nextTick(() => {
        this.isPreloading = false;
        this.waterfall();
      });
    },
    // 计算列数
    calcuCols() {
      let waterfallWidth = this.width ? this.width : window.innerWidth;
      let cols = Math.max(parseInt(waterfallWidth / this.colWidth), 2);
      return this.isMobile ? 2 : cols;
    },
    waterfall() {
      this.imgBoxEls = this.$refs.scrollEl.children;
      if (!this.imgBoxEls) return;
      let top, left, height;
      if (this.beginIndex == 0) this.colsHeightArr = [];
      for (let i = this.beginIndex; i < this.imgsArr.length; i++) {
        if (!this.imgBoxEls[i]) return;
        height = this.imgBoxEls[i].offsetHeight;
        if (i < this.cols) {
          //第一排，直接把高塞入数组
          this.colsHeightArr.push(height);
          top = 0;
          left = i * this.colWidth;
        } else {
          let minHeight = Math.min.apply(null, this.colsHeightArr); // 最低高低
          let minIndex = this.colsHeightArr.indexOf(minHeight); // 最低高度的索引
          top = minHeight;
          left = minIndex * this.colWidth;
          // 更新colsHeightArr
          this.colsHeightArr[minIndex] = minHeight + height;
        }
        this.imgBoxEls[i].style.left = left + "px";
        this.imgBoxEls[i].style.top = top + "px";
      }
      this.beginIndex = this.imgsArr.length; // 排列完之后，新增图片从这个索引开始预加载图片和排列
    },
    response() {
      let old = this.cols;
      this.cols = this.calcuCols();
      if (old === this.cols) return; // 列数不变直接退出
      this.beginIndex = 0; // 开始排列的元素索引
      this.waterfall();
    },
    // ==5== 滚动触底事件
    scrollFn() {
      let scrollEl = this.$refs.scrollEl;
      //如果正在预加载
      if (this.isPreloading) return;
      let minHeight = Math.min.apply(null, this.colsHeightArr);
      if (
        scrollEl.scrollTop + scrollEl.offsetHeight >
        minHeight - this.reachBottomDistance
      ) {
        this.isPreloading = true;
        this.$emit("scrollReachBottom");
      }
    },
    scroll() {
      this.$refs.scrollEl.addEventListener("scroll", this.scrollFn);
    },
    handleClickImage(e, value) {
      this.$emit("click", e, value);
    },
    // ==7== 下拉事件
    pullDown() {
      let scrollEl = this.$el.querySelector(".vue-waterfall-scroll");
      let startY;
      scrollEl.addEventListener("touchmove", (e) => {
        if (scrollEl.scrollTop === 0) {
          let t = e.changedTouches[0];
          if (!startY) startY = t.pageY;
          let pullDownDistance = t.pageY - startY;
          if (pullDownDistance > 0) {
            e.preventDefault();
          }
          this.$emit("pullDownMove", pullDownDistance);
        }
      });
      scrollEl.addEventListener("touchend", () => {
        if (scrollEl.scrollTop === 0) {
          startY = NaN;
          this.$emit("pullDownEnd");
        }
      });
    },
  },
  mounted() {
    this.isMobile = isMobile();
    this.preload();
    this.cols = this.calcuCols();
    if (!this.isMobile && !this.width)
      window.addEventListener("resize", this.response);
    if (this.isMobile && this.enablePullDownEvent) this.pullDown();
    this.scroll();
  },
};
</script>

<style lang="scss">
.vue-waterfall-container {
  width: 100%;
  height: 100%;
  position: relative;

  .vue-waterfall-scroll {
    position: relative;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }

  .img-box {
    position: absolute;
    box-sizing: border-box;

    //卡片出来时的动画
    &.default-card-animation {
      animation: show-card 0.4s;
      transition: left 0.6s, top 0.6s;
      transition-delay: 0.1s;
    }
    @keyframes show-card {
      0% {
        transform: scale(0.5);
      }
      100% {
        transform: scale(1);
      }
    }
    .cardStyle {
      box-shadow: rgba(0, 0, 0, 0.2) 0px 3px 1px -2px,
        rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
      border-radius: 4px;
      img {
        width: 100%;
        display: block;
        border-radius: 4px 4px 0 0;
      }
    }

    &.__err__ {
      .img-inner-box {
        background-image: url(data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk1M0JCM0QwNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk1M0JCM0NGNkVFNDExRThCNTJCQUQ2RDFGQzg0NzIxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTYwRUMyMDE2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTYwRUMyMDI2RUUzMTFFOEJCRTU5RTFDODg1ODgwMjYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAQCwsLDAsQDAwQFw8NDxcbFBAQFBsfFxcXFxcfHhcaGhoaFx4eIyUnJSMeLy8zMy8vQEBAQEBAQEBAQEBAQEBAAREPDxETERUSEhUUERQRFBoUFhYUGiYaGhwaGiYwIx4eHh4jMCsuJycnLis1NTAwNTVAQD9AQEBAQEBAQEBAQED/wAARCACRAJEDASIAAhEBAxEB/8QAZQAAAwEBAQAAAAAAAAAAAAAAAAIDAQQHAQEAAAAAAAAAAAAAAAAAAAAAEAACAQMDBAEFAAMBAAAAAAAAAQIRMQMhQRJRYYEycZHBIkITsdFSYhEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A9AAAAAMFnNQWt9kAwkssVbV9CTnKb10XQVtLSyAd5ZuzURW27yfhmX9RlDI+wD4Vf/ZVi41SKCdeNI3YEnOXJtOiBZZr/wBGcMi2Ft7AXjli76PoOcqael0Mpyg9NV0A6QEhNTWl90MBoAAAAAAGGiTlxjXfZAZkycdEqyI3q26sOrd92CTm6bbsA1boh1i3lqPGKiqIZAYklYHY0x6tIDY2B3NdjEBgNJ3NACTxbx0E1TozoYsoqSowI2o06MtjyctGqSItODptsw6NX2YHSaJCXKNd90OAAAAYznnLnJvZWK5pUjRXloiNdwCjk0l9S0YqKohcSpGrvLUcDUBLK23x23FWNtVSAuHch/KXQP5PoBdqq77GJ1XfczFVKjVBcuPk6rXqBQCH8n0D+UugFwZD+bV1oNif5OOzQDyipKjI0cW0/qXYmVVjVXjqAkZcHXZ3OhHNXcthlWNHeOjAoAABDLKs6bISlWl1Busm+42Jfm30At2BmI1gRy+3gpD1XwTy+3gpH1QDASyt8uKdFuJRw1iwOjdBKy+TIutGbK3kAAxtJNuwiywdmA7s/glj9/BV04unQli9l8AWDsBjAhSja6D4pUnTZmZV+afUVOkk+4HUBgAc0bD4v2+fsJGw+L9vn7AVQMEDAjl9vBSHqvgnl9vBSHqvgDJwbfJC8JPSlEO5wTo3qMnUDEqNGz0jXoD08BRSXyBB/m6u2xvFPQ1qjoDAVNxqv1ZuJUnT5BGw9/AFQYAwJZf1+fsJKw+X9fn7CSsB0AAAc7VG13GxP82uoZFSbezFWkkwOgGCBgRy15adDZTaioq7QZPfwZQDFFfPc2MnB0vE1AwCc+WituPjaS4kzU6agPkS9hEVeqJJU0AAh7+ACHv4AqAAwI5X+aXQVKrS7g3WTY2ONZp7IC9AAAJ5lWNf+dSV1XqdL1VGc8lxk47bAUxyqqO60GIpuL5LyuxZNNVVtmAmVfkpbbi1RYAI1QVRYAI1QJ1aRYzdAbJ8Y1I1RZggI1SNxL8uW1NCoAYxckqKiu9Bm0lV23ZFtyfJ+F2Ayyr0K4VSNf8ArUnFcpKO250LRUQABoAYLkhzXdWHMA5u26uNGXF9tx8uOusfYlbTcC6aaqrdTTnTlHVfQrHJF6PRsBwAAC5i9vg0xbgaAIAAxtJVduosskVotWiTcpav6ANKXJ9the27sF9NyuLHTWXsA2OHBd3cYDQAAAAAAAwSeNS1syhgHNRxdJfUK10ujoaTuJLCrp0Amm1Ztdhv6z3Sfkxwmu4leqoBT+1P1f8AkZy4469daEaopllRqPRAH9ZOyp5Fbbu2+xmuyGUJvsAtaaWQUcnSP1Kxwq7dR0krALDGo63Y4GgAAAAAAAAAAAAAAAAAshJ7AAGK6B3YABsNx4gADAAAAAAAAAAAAAf/2Q==);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 50% 50%;

        & > img {
          display: none;
        }
      }
    }
  }

  > .loading {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 6px;
    z-index: 999;

    &.first {
      bottom: 50%;
      transform: translate(-50%, 50%);
    }

    &.ball-beat {
      > .dot {
        vertical-align: bottom;
        background-color: #4b15ab;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin: 3px;
        animation-fill-mode: both;
        display: inline-block;
        animation: loading 0.7s 0s infinite linear;

        &:nth-child(2n-1) {
          animation-delay: 0.35s;
        }
      }
    }
    @keyframes loading {
      50% {
        opacity: 0.2;
        transform: scale(0.75);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}
</style>
