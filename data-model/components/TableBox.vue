<template>
  <div class="box" @dragend="handleDragEnd">
    <div :class="{ 'item-arr': table.leftRelations.length === 0 }" class="item">
      <h6
        :class="{'over': table.over}"
        draggable="true"
        @dragstart.stop="handleDragStart($event, table)"
        @dragenter.stop="handleDragenter($event, table)"
        @dragover.stop="handleDragOver($event, table)"
        @dragleave.stop="handleDragleave($event, table)"
        @drop.stop="handleDrop($event, table)"
      >{{ table.tableName }}</h6>
      <i class=""/>
      <span class="opt">
        <b v-show="table.leftRelations.length > 0" class="num">{{ table.leftRelations.length }}</b>
        <i class="el-icon-arrow-down"/>
        <i v-show="table.leftRelations.length === 0" class="el-icon-plus"/>
      </span>
    </div>
    <div v-if="table.rightTables.length>0" class="wrap">
      <table-box v-for="(item, index) in table.rightTables" :key="index" :table="item"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableBox',
  props: {
    table: {
      type: Object,
      default: function() {
        return {
          tableName: '',
          over: true,
          leftRelations: [],
          rightTables: [],
          leftTable: null
        }
      }
    }
  },
  data() {
    return {
      model: null
    }
  },
  created() {
    const parent = this.$parent

    if (parent.isModel) {
      this.model = parent
    } else {
      this.model = parent.model
    }
  },
  methods: {
    handleDragStart(event, target) {
      this.model.$emit('table-drag-start', target, event)
    },
    handleDragenter(event, target) {
      if (target !== this.draging) {
        target.over = true
      }
    },
    handleDragOver(event, target) {
      event.preventDefault()
    },
    handleDragleave(event, target) {
      if (target !== this.draging) {
        target.over = false
      }
    },
    handleDrop(event, target) {
      target.over = false
      this.model.$emit('table-drag-drop', target, event)
    },
    handleDragEnd(event) {
      this.model.$emit('table-drag-end', event)
    }
  }
}
</script>
