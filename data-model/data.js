export default {
  status: 'success',
  msg: 'success',
  data: {
    databases: ['information_schema', 'yofc_test'],
    dataModel: {
      id: 127,
      name: '测试模型lmr',
      dataConnectionId: 9527,
      dataConnection: {
        id: 9527,
        connectionName: '测试连接1',
        connectionType: 0,
        ipAddress: '114.55.98.37',
        port: '3306',
        username: 'yofc_test',
        password: 'yofc_test',
        createUser: null,
        gmtCreate: null,
        updateUser: null,
        gmtModified: null
      },
      databaseName: 'yofc_test',
      modelTables: [
        {
          modelTableId: 62,
          modelId: 127,
          tableName: 'class',
          tabRelations: [
            {
              tableRelationId: 21,
              modelTableId: 62,
              rightTable: 'class_student_relation',
              rightColumn: 'class_id',
              leftColumn: 'class_id',
              operation: '=',
              createUser: 10086,
              gmtCreate: '2019-03-06T01:07:55.000+0000',
              updateUser: null,
              gmtModified: null
            },
            {
              tableRelationId: 21,
              modelTableId: 62,
              rightTable: 'course',
              rightColumn: 'class_id',
              leftColumn: 'class_id',
              operation: '=',
              createUser: 10086,
              gmtCreate: '2019-03-06T01:07:55.000+0000',
              updateUser: null,
              gmtModified: null
            },
            {
              tableRelationId: 21,
              modelTableId: 62,
              rightTable: 'level',
              rightColumn: 'class_id',
              leftColumn: 'class_id',
              operation: '=',
              createUser: 10086,
              gmtCreate: '2019-03-06T01:07:55.000+0000',
              updateUser: null,
              gmtModified: null
            }
          ],
          createUser: 10086,
          gmtCreate: '2019-03-06T01:07:55.000+0000',
          updateUser: null,
          gmtModified: null
        },
        {
          modelTableId: 63,
          modelId: 127,
          tableName: 'student',
          tabRelations: [],
          createUser: 10086,
          gmtCreate: '2019-03-06T01:07:55.000+0000',
          updateUser: null,
          gmtModified: null
        },
        {
          modelTableId: 64,
          modelId: 127,
          tableName: 'class_student_relation',
          tabRelations: [
            {
              tableRelationId: 22,
              modelTableId: 64,
              rightTable: 'student',
              rightColumn: 'student_id',
              leftColumn: 'student_id',
              operation: '=',
              createUser: 10086,
              gmtCreate: '2019-03-06T01:07:55.000+0000',
              updateUser: null,
              gmtModified: null
            }
          ],
          createUser: 10086,
          gmtCreate: '2019-03-06T01:07:55.000+0000',
          updateUser: null,
          gmtModified: null
        },
        {
          modelTableId: 64,
          modelId: 127,
          tableName: 'course',
          tabRelations: [],
          createUser: 10086,
          gmtCreate: '2019-03-06T01:07:55.000+0000',
          updateUser: null,
          gmtModified: null
        },
        {
          modelTableId: 64,
          modelId: 127,
          tableName: 'level',
          tabRelations: [],
          createUser: 10086,
          gmtCreate: '2019-03-06T01:07:55.000+0000',
          updateUser: null,
          gmtModified: null
        }
      ],
      createUser: 10086,
      gmtCreate: '2019-03-06T01:07:55.000+0000',
      updateUser: null,
      gmtModified: null
    }
  },
  code: '200'
}
