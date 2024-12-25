<template>
  <div class="statistic-container">
    <el-form :model="filterForm" label-width="120px">
      <el-form-item label="起始年月">
        <el-date-picker
          v-model="filterForm.startDate"
          type="month"
          placeholder="选择起始年月"
          format="YYYY-MM"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="终止年月">
        <el-date-picker
          v-model="filterForm.endDate"
          type="month"
          placeholder="选择终止年月"
          format="YYYY-MM"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="乡镇">
        <el-cascader :options="provinces" placeholder="请选择省份/城市/乡镇" v-model="filterForm.address" clearable
          :props="{
            expandTrigger: 'hover',
            children: 'children',
            emitPath: true,
            showAllLevels: false,
            value: 'value'
          }"
        ></el-cascader>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="statistics" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="month" label="月份"></el-table-column>
      <el-table-column prop="promotionUsers" label="宣传用户数"></el-table-column>
      <el-table-column prop="supportUsers" label="助力用户数"></el-table-column>
    </el-table>

    <div id="chart" style="width: 100%; height: 400px; margin-top: 20px;"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'Statistic',
  setup() {
    const filterForm = ref({
      startDate: '',
      endDate: '',
      address: []
    });

    const provinces = ref([]);
    const statistics = ref([]);

    const fetchTowns = () => {
      return axios.get('http://localhost:8080/publicize/getTownList')
        .then(response => {
          if (response.data.code === 200) {
            provinces.value = JSON.parse(response.data.data);
          } else {
            throw new Error(response.data.message || '获取乡镇信息失败');
          }
        });
    };

    const fetchStatistics = () => {
      const townID = filterForm.value.address[filterForm.value.address.length - 1];
      axios.get('http://localhost:8080/admin/statistics', {
        params: {
          startDate: filterForm.value.startDate,
          endDate: filterForm.value.endDate,
          townID: townID
        }
      }).then(response => {
        if (response.data.code === 200) {
          statistics.value = response.data.data;
          renderChart();
        } else {
          ElMessage.error(response.data.message || '查询失败');
        }
      }).catch(error => {
        ElMessage.error('查询失败: ' + error.message);
      });
    };

    const handleSearch = () => {
      if (!filterForm.value.startDate || !filterForm.value.endDate) {
        ElMessage.warning('请选择起始和终止日期');
        return;
      }
      if (!filterForm.value.address || filterForm.value.address.length === 0) {
        ElMessage.warning('请选择乡镇');
        return;
      }
      fetchStatistics();
    };

    const renderChart = () => {
      const chart = echarts.init(document.getElementById('chart'));
      const months = statistics.value.map(item => item.month);
      const promotionUsers = statistics.value.map(item => item.promotionUsers);
      const supportUsers = statistics.value.map(item => item.supportUsers);

      const option = {
        title: {
          text: '宣传情况月汇总分析'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['宣传用户数', '助力用户数']
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '宣传用户数',
            type: 'line',
            data: promotionUsers
          },
          {
            name: '助力用户数',
            type: 'line',
            data: supportUsers
          }
        ]
      };

      chart.setOption(option);
    };

    onMounted(() => {
      fetchTowns();
    });

    return {
      filterForm,
      provinces,
      statistics,
      fetchStatistics,
      handleSearch
    };
  }
};
</script>

<style scoped>
.statistic-container {
  padding: 20px;
}
</style>