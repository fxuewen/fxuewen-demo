<template>
  <el-container v-loading="loading" class="data-model">
    <el-aside width="300px">
      <el-form :model="searchForm" label-position="top" size="mini">
        <el-form-item label="数据库">
          <el-select v-model="searchForm.databaseName" @change="getTableList">
            <el-option
              v-for="item in databases"
              :key="item"
              :label="item"
              :value="item"/>
          </el-select>
        </el-form-item>
        <el-form-item label="表">
          <el-input v-model="searchForm.tableName" clearable placeholder="请输入关键词搜索" @input="tableFilter"/>
        </el-form-item>
        <div class="table-list">
          <div v-for="(table, index) in showTables" :key="index" class="table-item">
            <span :title="table" draggable="true" class="table-item-name" @dragstart="handleDragstart($event, table)">{{ table }}</span>
          </div>
        </div>
      </el-form>
    </el-aside>
    <el-main>
      <model-table
        :root-table="rootTable"
        @table-drag-start="tableDragStart"
        @table-drag-drop="tableDragDrop"
        @table-drag-end="tableDragEnd"
        @dragover.native="handleDragover($event)"
        @drop.native="handleDragDrop($event)"
      />
    </el-main>
  </el-container>
</template>

<script>
import { getModelInfo, getTables } from '@/api/dataModel'
import ModelTable from './components/ModelTable.vue'
// import localData from './data.js'

export default {
  name: 'DataModel',
  components: { ModelTable },
  data() {
    return {
      loading: false,
      searchForm: {
        databaseName: '',
        tableName: ''
      },
      tables: [],
      databases: [],
      dataModel: {},
      showTables: [],
      rootTable: null,
      draging: null
    }
  },
  mounted() {
    this.getModelData()
  },
  methods: {
    // 根据id获取数据连接详情
    getModelData() {
      this.loading = true
      getModelInfo()
        .then(res => {
          const data = res.data.data
          this.loading = false
          this.databases = data.databases
          this.dataModel = data.dataModel
          this.searchForm.databaseName = this.databases[0]
          this.getTableList()
          this.rootTable = this.getRootTable(this.dataModel.modelTables)
        })
        .catch(() => {
          this.loading = false
        })
    },

    // 获取数据库表集合
    getTableList() {
      const params = {
        dataConnectionId: this.dataModel.dataConnectionId,
        databaseName: this.searchForm.databaseName
      }
      getTables(params).then(res => {
        this.tables = res.data.data
        this.tableFilter()
      })
    },

    // 表过滤
    tableFilter() {
      this.showTables = []
      this.tables.forEach(table => {
        if (table.toLowerCase().indexOf(this.searchForm.tableName.toLowerCase()) > -1) {
          this.showTables.push(table)
        }
      })
    },

    // 通过表名获取表
    getTableByName(tables, name) {
      let target = null
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i]
        if (table.tableName === name) {
          target = table
          break
        }
      }

      return target
    },

    // 获取根节点数据表
    getRootTable(modelTables) {
      let rootTable = null
      // 提取表的向右关联表
      modelTables.forEach(table => {
        this.$set(table, 'over', false)
        this.$set(table, 'tabRelations', table.tabRelations)
        if (!table.rightTables) {
          this.$set(table, 'rightTables', [])
        }
        if (!table.leftRelations) {
          this.$set(table, 'leftRelations', [])
        }
        table.tabRelations.forEach(tabRelation => {
          const rightNode = this.getTableByName(modelTables, tabRelation.rightTable)
          if (rightNode && !rightNode.leftRelations) {
            rightNode.leftRelations = []
          }
          if (rightNode && !rightNode.leftTable) {
            this.$set(rightNode, 'leftTable', table)
          }
          // 左关联关系
          rightNode && rightNode.leftRelations.push(tabRelation)
          if (!this.getTableByName(table.rightTables, tabRelation.rightTable)) {
            rightNode && table.rightTables.push(rightNode)
          }
        })
      })
      // 获取根节点数据表
      for (let i = 0; i < modelTables.length; i++) {
        const modelTable = modelTables[i]
        if (!modelTable.leftTable) {
          rootTable = modelTable
        }
      }
      console.log(rootTable)
      return rootTable
    },

    // 拖动数据表
    tableDragStart(target) {
      console.log('lalala')
      this.draging = target
    },

    // 拖动数据表放置
    tableDragDrop(target) {
      const tableName = event.dataTransfer.getData('tableName')
      if (!this.draging) {
        if (tableName) {
          this.addTable2Model(target, tableName)
        }
        return
      }

      // 判断目标放置位置是否有效
      if (!this.isValidDropTable(target)) {
        return
      }

      const leftTable = this.draging.leftTable
      // 删除拖动对象和它父节点的关联关系
      leftTable.tabRelations.forEach((tabRelation, index) => {
        if (tabRelation.rightTable === this.draging.tableName) {
          leftTable.tabRelations.splice(index, 1)
        }
      })

      // 从原父节点的右边数据表中删除
      leftTable.rightTables.forEach((table, index) => {
        if (table.tableName === this.draging.tableName) {
          leftTable.rightTables.splice(index, 1)
        }
      })

      // 加入到新的位置
      target.rightTables.push(this.draging)
      // 拖动过后清空左关联关系
      this.$set(this.draging, 'leftRelations', [])
      this.draging.leftTable = target
    },

    // 拖动数据表完成
    tableDragEnd() {
      this.draging = null
    },

    // 拖动目标是否在拖动对象的子节点链上
    getChildTableByName(table, tableName) {
      let childTable = null
      for (let i = 0; i < table.rightTables.length; i++) {
        const rightTable = table.rightTables[i]
        if (rightTable.tableName === tableName) {
          childTable = rightTable
          break
        }
        childTable = this.getChildTableByName(rightTable, tableName)
        if (childTable) {
          return childTable
        }
      }

      return childTable
    },
    // 是否是可放置的数据表
    isValidDropTable(targetTable) {
      // 1.根节点数据表不可拖动
      if (!this.draging.leftTable) {
        this.$message({
          message: '根节点数据表不可移动',
          type: 'warning'
        })
        return false
      }

      // 2.位置未发生变化
      if (this.draging === targetTable || this.getTableByName(targetTable.rightTables, this.draging.tableName)) {
        return false
      }

      // 3.放置位置在移动数据表的子节点链上
      if (this.getChildTableByName(this.draging, targetTable.tableName)) {
        this.$message({
          message: '放置位置在移动数据表的子节点链上',
          type: 'warning'
        })
        return false
      }

      return true
    },

    // 拖动数据表
    handleDragstart(event, tableName) {
      event.dataTransfer.setData('tableName', tableName)
    },

    // 拖动经过容器
    handleDragover(event) {
      event.preventDefault()
    },

    // 放置
    handleDragDrop(event) {
      event.preventDefault()
      const tableName = event.dataTransfer.getData('tableName')
      if (!this.rootTable) {
        this.rootTable = {
          tableName: tableName,
          over: false,
          leftTable: null,
          leftRelations: [],
          rightRelations: [],
          rightTables: []
        }
      }
      console.log(tableName)
    },

    // 向模型中添加数据表
    addTable2Model(target, tableName) {
      if (this.getChildTableByName(this.rootTable, tableName)) {
        this.$message({
          message: '数据表在模型中已经存在',
          type: 'warning'
        })
        return
      }

      if (this.getTableByName(target.rightTables, tableName) || target.tableName === tableName) {
        this.$message({
          message: '数据表在该位置已存在',
          type: 'warning'
        })
        return
      }

      const table = {
        tableName: tableName,
        over: false,
        leftTable: target,
        leftRelations: [],
        rightRelations: [],
        rightTables: []
      }
      target.rightTables.push(table)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.data-model {
  height: calc(100vh - 84px);

  .el-aside {
    color: #333;
    height: 100%;
    border-right: 1px solid #ddd;

    .el-form {
      padding: 16px;

      .el-form-item {
        margin-bottom: 0;
      }

      .el-form-item__label {
        padding: 0 !important;
      }
    }

    .table-list {
      margin-top: 24px;

      .table-item {
        .table-item-name {
          display: inline-block;
          font-size: 12px;
          padding: 8px;
          width: 200px;
          margin-top: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          border: 1px solid transparent;

          &:hover {
            border: 1px solid #ddd;
          }
        }
      }
    }
  }

  .el-main {
    color: #333;
    height: 100%;
  }
}
</style>
