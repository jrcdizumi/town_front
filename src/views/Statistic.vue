<template>
  <div class="statistic-container">
    <el-form :model="filterForm" label-width="120px" @submit.prevent="fetchStatistics">
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
      <el-form-item label="地域">
        <el-input v-model="filterForm.region" placeholder="输入地域"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchStatistics">查询</el-button>
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

export default {
  name: 'Statistic',
  setup() {
    const filterForm = ref({
      startDate: '',
      endDate: '',
      region: ''
    });

    const statistics = ref([]);

    const fetchStatistics = () => {
      axios.get('http://localhost:8080/statistics', {
        params: {
          startDate: filterForm.value.startDate,
          endDate: filterForm.value.endDate,
          region: filterForm.value.region
        }
      }).then(response => {
        if (response.data.code === 200) {
          statistics.value = response.data.data;
          renderChart();
        } else {
          console.error('查询失败', response.data.message);
        }
      }).catch(error => {
        console.error('查询失败', error);
      });
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
      fetchStatistics();
    });

    return {
      filterForm,
      statistics,
      fetchStatistics
    };
  }
};
</script>

<style scoped>
.statistic-container {
  padding: 20px;
}
</style>