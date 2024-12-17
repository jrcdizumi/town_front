<template>
  <div class="list-container">
    <el-table :data="paginatedList" style="width: 100%">
      <el-table-column prop="stitle" label="标题"></el-table-column>
      <el-table-column prop="sdesc" label="描述"></el-table-column>
      <el-table-column prop="supportState" label="状态">
        <template v-slot="scope">
          <el-tag :type="getStatusType(scope.row.supportState)">
            {{ getStatusText(scope.row.supportState) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="promotionTitle" label="关联的宣传"></el-table-column>
      <el-table-column label="操作" width="120">
        <template v-slot="scope">
          <el-button @click="viewDetails(scope.row.sid)" type="primary" size="small">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next"
      :total="supportList.length"
      :page-sizes="[5, 10, 20, 50]"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      supportList: [],
      currentPage: 1,
      pageSize: 5
    };
  },
  computed: {
    paginatedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      return this.supportList.slice(start, end);
    }
  },
  created() {
    this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      try {
        await this.fetchSupportList();
        await this.fetchPromotionTitles();
        console.log('数据加载成功');
      } catch (error) {
        console.error('数据加载失败:', error);
        this.$message.error('数据加载失败，请刷新页面重试。');
      }
    },
    async fetchSupportList() {
      const token = localStorage.getItem('token');
      const response = await this.$axios.get('http://localhost:8080/support/mylist', {
        headers: { token }
      });
      if (response.data.code === 200) {
        this.supportList = response.data.data;
      } else {
        throw new Error(response.data.message || '获取援助列表失败');
      }
    },
    async fetchPromotionTitles() {
      const promises = this.supportList.map(async (support) => {
        try {
          const { data } = await this.$axios.get('http://localhost:8080/publicize/detail', {
            params: { id: support.pid },
          });
          if (data.code === 200) {
            support.promotionTitle = data.data.ptitle;
          } else {
            support.promotionTitle = '未找到对应的宣传信息';
          }
        } catch (error) {
          console.error('获取宣传标题失败:', error);
          support.promotionTitle = '获取宣传标题失败';
        }
      });
      await Promise.all(promises);
    },
    getStatusType(status) {
      const types = {
        0: 'info',    // 待审核
        1: 'success', // 已通过
        2: 'warning'  // 已拒绝
      };
      return types[status] || 'info';
    },
    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝'
      };
      return statusMap[status] || '未知状态';
    },
    viewDetails(sid) {
      this.$router.push({ name: 'TownSupportDetail', params: { id: sid } });
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleSizeChange(size) {
      this.pageSize = size;
    }
  }
};
</script>

<style scoped>
.list-container {
  padding: 20px;
}
</style>

