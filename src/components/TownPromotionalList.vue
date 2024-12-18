<template>
  <div class="list-container">
    <div class="filter-container">
      <el-checkbox v-model="showMyPromotions" @change="filterPromotions">只显示我的宣传</el-checkbox>
    </div>
    <el-table :data="paginatedList" style="width: 100%">
      <!-- <el-table-column prop="pid" label="ID" width="50"></el-table-column> -->
      <el-table-column prop="townID" label="乡镇">
        <template v-slot="scope">
          <span>{{ getTownName(scope.row.townID) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ptypeId" label="宣传类型">
        <template #header>
          <div style="display: flex; align-items: center;">
            <span>宣传类型</span>
            <el-select 
              v-model="selectedType" 
              size="small" 
              placeholder="选择类型"
              clearable
              style="margin-left: 10px; width: 120px;"
              @change="filterPromotions">
              <el-option
                v-for="type in promotionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value">
              </el-option>
            </el-select>
          </div>
        </template>
        <template v-slot="scope">
          <span>{{ getPromotionTypeName(scope.row.ptypeId) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ptitle" label="主题"></el-table-column>
      <el-table-column prop="pdesc" label="描述"></el-table-column>
      <el-table-column prop="pfileList" label="图片">
        <template v-slot="scope">
          <div class="image-preview">
            <el-image
              v-for="url in scope.row.pfileList.split(',')"
              :key="url"
              :src="url"
              style="width: 100px; height: 100px; margin-right: 10px"
            ></el-image>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="videourl" label="视频介绍">
        <template v-slot="scope">
          <a :href="scope.row.videourl" target="_blank">{{ scope.row.videourl }}</a>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="120">
        <template v-slot="scope">
          <el-button @click="viewDetails(scope.row.pid)" type="primary" size="small">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :current-page="currentPage"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next"
      :total="filteredPromotionalList.length"
      :page-sizes="[5, 10, 20, 50]"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
        promotionTypes: [ // 示例宣传类型数据
        { value: 'type1', label: '类型1' },
        { value: 'type2', label: '类型2' },
        { value: 'type3', label: '类型3' },
        ],
        provinces: [], // 初始化为空数组，后续通过接口获取数据
      promotionalList: [],
      currentPage: 1,
      pageSize: 5,
      showMyPromotions: false, // 新增变量
      filteredPromotionalList: [], // 新增变量
      userId: null, // 新增变量
      selectedType: '' // 新增：选中的宣传类型
    };
  },
  computed: {
    paginatedList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      return this.filteredPromotionalList.slice(start, end);
    }
  },
  created() {
      this.loadInitialData();
    },
  methods: {
    loadInitialData() {
          // 需要加载省份和宣传类型的数据
    Promise.all([
    this.fetchTowns(), // 调用获取乡镇信息的函数
    this.fetchPromotionTypes(),
    this.fetchPromotionalList() // 调用获取宣传列表的函数
    ])
    .then(() => {
    console.log('数据加载成功');
    })
    .catch(error => {
    console.error('数据加载失败:', error);
    this.loadError = true;
    this.$message.error('数据加载失败，请刷新页面重试。');
    });
    },
    fetchTowns() {
        return this.$axios.get('http://localhost:8080/publicize/getTownList')
        .then(response => {
            if (response.data.code === 200) {
            const rawData = JSON.parse(response.data.data);
            this.provinces = this.parseTowns(rawData);
            console.log(this.provinces);
            } else {
            throw new Error(response.data.message || '获取乡镇信息失败');
            }
        });
    },
    parseTowns(data) {
      const result = [];
      data.forEach(province => {
        province.children.forEach(city => {
          city.children.forEach(town => {
            result.push({
              label: `${province.label}/${city.label}/${town.label}`,
              value: town.value
            });
          });
        });
      });
      return result;
    },
    // 获取宣传类型数据的函数
    fetchPromotionTypes() {
    return this.$axios.get('http://localhost:8080/publicize/getTypeList')
    .then(response => {
        if (response.data.code === 200) {
        const typesData = response.data.data;
        // 将对象转换为数组，label为键，value为值
        this.promotionTypes = Object.keys(typesData).map(key => ({
            label: key,
            value: typesData[key],
        }));
        console.log(typesData);
        } else {
        throw new Error(response.data.message || '获取宣传类型数据失败');
        }
    });
    },
    fetchPromotionalList() {
      return this.$axios.get('http://localhost:8080/publicize/getPromotionalList')
        .then(response => {
          if (response.data.code === 200) {
            this.promotionalList = JSON.parse(response.data.data);
            this.filterPromotions(); // 调用过滤函数
            console.log('宣传列表:', this.promotionalList);
          } else {
            throw new Error(response.data.message || '获取宣传列表失败');
          }
        });
    },
    async checkSameUser(puserid) {
      try {
        const token = localStorage.getItem('token');
        const response = await this.$axios.get('http://localhost:8080/user/checkSameUser', {
          params: { userId: puserid },
          headers: { token }
        });
        return response.data.code === 200;
      } catch (error) {
        console.error('用户验证失败:', error);
        return false;
      }
    },
    async filterPromotions() {
      let filteredList = [...this.promotionalList];
      
      // 根据类型筛选
      if (this.selectedType) {
        filteredList = filteredList.filter(item => item.ptypeId === this.selectedType);
      }

      // 根据用户筛选
      if (this.showMyPromotions) {
        const finalList = [];
        for (const promotion of filteredList) {
          const isSameUser = await this.checkSameUser(promotion.puserid);
          if (isSameUser) {
            finalList.push(promotion);
          }
        }
        this.filteredPromotionalList = finalList;
      } else {
        this.filteredPromotionalList = filteredList;
      }
    },
    getTownName(townID) {
      console.log('查找 townID:', townID);
      console.log('当前 provinces:', this.provinces);
      const town = this.provinces.find(town => town.value === String(townID));
      console.log('找到的 town:', town);
      return town ? town.label : '未知乡镇';
    },
    getPromotionTypeName(ptypeId) {
      const type = this.promotionTypes.find(type => type.value === ptypeId);
      return type ? type.label : '未知类型';
    },
    viewDetails(pid) {
      // 跳转到详情页并传递 pid 参数
      this.$router.push({ name: 'TownPromotionalDetail', params: { id: pid } });
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
.filter-container {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}
.image-preview {
  display: flex;
  flex-wrap: wrap;
}
</style>