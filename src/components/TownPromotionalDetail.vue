<template>
  <div class="detail-container">
    <el-card>
      <h2>{{ promotional.ptitle }}</h2>
      <p>类型: {{ getTypeLabel(promotional.ptypeId) }}</p>
      <p>描述: {{ promotional.pdesc }}</p>
      <p>图片列表:</p>
      <el-image
        v-for="(url, index) in imageList"
        :key="url"
        :src="url"
        :preview-src-list="imageList"
        :preview-index="index"
        style="width: 100px; height: 100px; margin-right: 10px"
      ></el-image>
      <p>视频链接: <a :href="promotional.videourl" target="_blank">{{ promotional.videourl }}</a></p>
      <p>乡镇: {{ getTownLabel(promotional.townID) }}</p>
      <div v-if="isNowUser">
        <el-button type="primary" @click="editPromotional">修改</el-button>
        <el-button type="danger" @click="deletePromotional">删除</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      promotional: {},
      promotionTypes: [ // 示例宣传类型数据
        { value: 'type1', label: '类型1' },
        { value: 'type2', label: '类型2' },
        { value: 'type3', label: '类型3' },
      ],
      provinces: [], // 初始化为空数组，后续通过接口获取数据
      isNowUser: false,
      towns: [],
    };
  },
  created() {
    this.loadInitialData()
  },
  computed: {
    imageList() {
      return this.promotional.pfileList ? this.promotional.pfileList.split(',') : [];
    }
  },

  methods: {
    async loadInitialData() {
          // 需要加载省份和宣传类型的数据
          Promise.all([
          this.getDetail(),
            this.fetchTowns(), // 调用获取乡镇信息的函数
            this.fetchPromotionTypes(),
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
                this.provinces = JSON.parse(response.data.data);
                this.towns = this.provinces.map(p => ({ label: p.name, value: p.id }));
                console.log(this.provinces);
              } else {
                throw new Error(response.data.message || '获取乡镇信息失败');
              }
            });
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
    // 获取详情数据
    async getDetail() {
      const id = this.$route.params.id;
      try {
        const { data } = await this.$axios.get(`http://localhost:8080/publicize/detail`, {
          params: { id }
        });
        if (data.code === 200) {
          this.promotional = data.data;
        } else if (data.code === 400) {
          this.$message.error('数据不存在');
          this.promotional = {};
        }
      } catch (error) {
        this.$message.error('请求失败');
        this.promotional = {};
      }
    },
    getTypeLabel(typeId) {
      const type = this.promotionTypes.find(t => t.value === typeId);
      return type ? type.label : typeId;
    },
    getTownLabel(townId) {
      for (const province of this.provinces) {
        if (province.children && Array.isArray(province.children)) {
          for (const city of province.children) {
            if (city.children && Array.isArray(city.children)) {
              const town = city.children.find(t => t.value == townId);
              if (town) {
                return `${province.label}/${city.label}/${town.label}`;
              }
            }
          }
        }
      }
      return townId;
    },
    editPromotional() {
      // 编辑逻辑
    },
    deletePromotional() {
      // 删除逻辑
    }
  }
};
</script>

<style scoped>
.detail-container {
  padding: 20px;
}
</style>