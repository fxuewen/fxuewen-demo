<template>
  <div class="model-table-map">
    <table-box v-if="rootTable" :table="rootTable" draggable="true"/>
  </div>
</template>

<script>
// import localData from '../data.js'
import TableBox from './TableBox.vue'
export default {
  components: { TableBox },
  props: {
    rootTable: {
      type: Object,
      default: () => {
        return null
      }
    }
  },
  data() {
    return {
      isModel: true
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang='scss'>
* {
  padding: 0;
  margin: 0;
}
.model-table-map {
  position: relative;
  box-sizing: border-box;
  padding: 25px;
  overflow: auto;
  user-select: none;
  border: 2px solid transparent;
  height: 100%;

  .box {
    white-space: nowrap;
    padding-right: 3px;

    .item,
    .wrap {
      position: relative;
      display: inline-block;
      vertical-align: top;
    }

    .item {
      position: relative;
      height: 38px;
      line-height: 37px;
      width: 218px;
      margin-bottom: 5px;
      border: 1px solid #dedede;
      color: #666;
      border-radius: 2px;
      background: #f1f1f1;

      &:hover {
        .opt {
          .el-icon-arrow-down {
            display: inline;
          }
        }
      }

      h6 {
        border-left: 2px solid transparent;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-indent: 8px;
        border: 1px solid transparent;

        &.over {
          border: 1px solid #42a0f8;
        }
      }

      &.item-arr {
        .opt {
          border-style: dashed;
          border-color: #ed5565;
        }
      }

      .opt {
        position: absolute;
        z-index: 9;
        left: -56px;
        top: 50%;
        width: 26px;
        height: 26px;
        line-height: 26px;
        margin-top: -13px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 50%;
        color: #999;
        background: #fff;
        cursor: pointer;

        .el-icon-arrow-down {
          position: absolute;
          top: 6px;
          right: -244px;
          font-size: 14px;
          display: none;
        }
      }
    }

    .wrap {
      overflow: hidden;
      margin-left: -4px;
      position: relative;

      .box {
        margin-left: 115px;
      }

      .box:first-child > .item:before {
        position: absolute;
        z-index: 200;
        top: -1px;
        left: -89px;
        width: 1px;
        height: 20px;
        background: #fff;
        content: '';
      }

      .box:first-child > .item:after {
        position: absolute;
        top: 19px;
        left: -120px;
        width: 120px;
        border-top: 1px solid #dedede;
        content: '';
      }

      .box + .box > .item:before {
        position: absolute;
        left: -89px;
        top: -10000px;
        bottom: 25px;
        border-left: 1px solid #dedede;
        content: '';
      }

      .box + .box > .item:after {
        position: absolute;
        top: 8px;
        left: -89px;
        width: 87px;
        height: 10px;
        border: 1px solid #dedede;
        border-width: 0 0 1px 1px;
        border-bottom-left-radius: 10px;
        content: '';
      }
    }
  }
}
</style>
