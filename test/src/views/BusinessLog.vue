<template>
  <section style="overflow: hidden; height: 100%;">
    <el-form :inline="true"
             size="mini"
             class="serchFrom">
      <el-form-item>
        <el-select v-model="value"
                   size="mini"
                   placeholder="请选择">
          <el-option v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <label>名称：</label>
        <el-input v-model="query"
                  style="width: 150px;"
                  placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleSearch"
                   type="primary">查询</el-button>
      </el-form-item>
    </el-form>
    <!--表格-->
    <el-table :data="tableList"
              stripe
              border
              highlight-current-row
              v-loading="listLoading"
              :header-cell-style="{'text-align': 'center'}"
              :cell-style="{'text-align': 'center'}"
              size="mini"
              height="80%"
              style="width: 100%;">
      <el-table-column type="index"
                       label="序号"> </el-table-column>
      </el-table-column>
      <el-table-column prop="log_level"
                       label="日志级别">
      </el-table-column>
      <el-table-column prop="type"
                       label="操作类型">
      </el-table-column>
      <el-table-column prop="log_message"
                       width="180"
                       :show-overflow-tooltip="true"
                       label="日志消息">
      </el-table-column>
      <el-table-column prop="log_datetime"
                       width="150"
                       :formatter="formatDateTime_CTEATETIME"
                       label="记录时间">
      </el-table-column>
    </el-table>
    <!--分页-->
    <el-col :span="24">
      <el-pagination background
                     small
                     layout="total, slot,prev, pager, next,jumper"
                     @current-change="handleCurrentChange"
                     :total="total"
                     :page-size="pageSize"
                     style="float: right; height: 10%;">
        <span style="margin-right: 10px; font-weight: 400; color: #606266;">(每页10条)</span>
      </el-pagination>
    </el-col>
  </section>
</template>

<script>
import _ from 'lodash'
import { getLogData } from '../api/api'
import format from '../date.js'
export default {
  //data是一个函数，返回一个对象，保证组件实例之间的data属性不会互相影响
  data () {
    return {
      total: 0,
      page: 1,
      pageSize: 10,
      query: '',
      listLoading: false,
      activeIndex: 1,
      menuList: [],
      tableList: [],    //表格数据  
      options: [{
        value: '',
        label: '所有'
      },{
        value: 'Add',
        label: '添加'
      }, {
        value: 'Delete',
        label: '删除'
      }, {
        value: 'Edit',
        label: '编辑'
      }],
      value: '',
    }
  },

  //定义函数，手动调用
  methods: {
    //时间格式化方法
    formatDate (date, formatter) {
      let patter = formatter ? formatter : 'yyyy-MM-dd hh:mm:ss '
      return !date || date == '' ? '' : format.formatDate.format(new Date(date), patter)
    },
    //创建时间格式化
    formatDateTime_CTEATETIME (row, column) {
      return this.formatDate(row.log_datetime)
    },
    //页数改变
    handleCurrentChange (val) {
      this.page = val
      this.getList()
    },
    //获取数据
    async getList () {
      this.listLoading = true
      let para_p = {
        key: this.query,
        select:this.value,
        page: this.page,
        intPageSize: this.pageSize,
      }
      //分页数据
      let res_p = await getLogData(para_p)
      let data_p = res_p.data.response
      data_p.data.forEach((item) => {
        if (item.log_message.indexOf("Add") != -1) {
          item.type = "添加"
        } else if (item.log_message.indexOf("Delete") != -1) {
          item.type = "删除"
        } else if (item.log_message.indexOf("Edit") != -1) {
          item.type = "编辑"
        }
      })
      this.tableList = data_p.data
      //console.table(JSON.parse(JSON.stringify(this.tableList)))
      this.total = data_p.dataCount
      this.page = data_p.page
      this.pageSize = data_p.PageSize
      this.listLoading = false
    },
    //查询数据
    handleSearch () {
      this.name = this.query
      this.getList()
    },
    //查询数据，_.debounce防抖动（（当持续触发事件时，会等到停止后一段时间才开始执行））函数，确保触发事件的时间间隔低于500毫秒时,则不会调用handleSearch函数
    handleQuery: _.debounce(function () {
      this.handleSearch()
    }, 500),
  },
  //挂载完成，dom树已经完成渲染到页面，可进行dom操作在模板渲染成html后调用，通常是初始化页面完成后，
  mounted () {
    this.getList()
  },


}
</script>
<style>
.serchFrom {
  display: flex; /*采用flex布局 */
  flex-direction: row; /*主轴方向（即项目排列方向）。值有row（主轴为水平方向，起点在左端）、row-reverse（主轴为水平方向，起点在右端）、column(主轴为垂直方向，起点在上沿)、column-reverse（主轴为垂直方向，起点在下沿）*/
  flex-wrap: nowrap; /*定义项目在一条轴线上排不下如何换行。值有nowrap（不换行）、wrap（换行，第一行在上方）、wrap-reverse（换行，第一行在下方）*/
  justify-content: flex-end; /*定义项目在主轴上的对齐方式。值有flex-start（左对齐）、flex-end（右对齐）、center（居中）、space-betwen（两端对齐，项目之间的间隔都相等）、space-around（每个项目两侧的间隔相等）*/
}
</style>