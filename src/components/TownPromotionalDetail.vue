<template>
  <div class="detail-container">
    <el-card>
      <div class="header" style="display: flex; justify-content: space-between;">
        <h2>{{ promotional.ptitle }}</h2>
        <div>
          <el-button v-if="isNowUser" type="primary" @click="editPromotional">修改</el-button>
          <el-button v-if="isNowUser" type="danger" @click="deletePromotional">删除</el-button>
          <el-button v-if="isLoggedIn" type="success" @click="addSupport">添加助力</el-button>
        </div>
      </div>
      <p>地址: {{ getTownLabel(promotional.townID) }}</p>
      <p>宣传类型: {{ getTypeLabel(promotional.ptypeId) }}</p>
      <p>描述: {{ promotional.pdesc }}</p>
      <p>图片列表:</p>
      <div class="media-container">
        <el-image
          v-for="(url, index) in imageList"
          :key="url"
          :src="url"
          :preview-src-list="imageList"
          :preview-index="index"
          class="image-item"
        ></el-image>
      </div>
      <video id="myVideo" 
        v-if="promotional.videourl"
        :key="promotional.videourl"      
        class="video-item" 
        controls 
        autoplay="false"
        preload="auto">
        <source :src="promotional.videourl" type="video/mp4">  
      </video> 
    </el-card>
  </div>

  <!-- 显示关联的支持信息 -->
  <div class="associated-supports">
    <h3>关联的助力信息</h3>
    <el-table :data="supportsList" style="width: 100%">
      <el-table-column prop="stitle" label="助力主题名称" width="180"></el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.supportState)">
            {{ getStatusText(scope.row.supportState) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="120">
        <template #default="scope">
          <el-image
            v-if="getFirstImage(scope.row.sfileList)"
            :src="getFirstImage(scope.row.sfileList)"
            :preview-src-list="[getFirstImage(scope.row.sfileList)]"
            style="width: 100px; height: 100px; object-fit: cover;"
          ></el-image>
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="sdesc" label="助力描述"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" size="small" @click="navigateToSupportDetail(scope.row.sid)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import VideoPlayer from 'vue-video-player' // 确保导入视频播放器组件
import { checkToken } from '../utils/tokenUtils' // 导入 checkToken 方法

export default {
  components: {
    VideoPlayer // 注册视频播放器组件
  },
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
      isLoggedIn: false, // 添加 isLoggedIn 状态
      towns: [],
      supportsList: [], // 添加支持列表数据属性
    };
  },
  created() {
    this.loadInitialData();
    this.verifyLoginStatus(); // 初始化登录状态
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
            this.getSupportsList(), // 调用获取支持列表的方法
          ])
          .then(() => {
            console.log('数据加载成功');
            this.checkSameUser();
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
    async checkSameUser() {
      try {
        const token = localStorage.getItem('token') 
        const response = await this.$axios.get('http://localhost:8080/user/checkSameUser', {
          params: { userId: this.promotional.puserid },
          headers: { 'token': token }
        });
        if (response.data.code === 200) {
          this.isNowUser = true;
        } else {
          this.isNowUser = false;
        }
      } catch (error) {
        console.error('用户验证失败:', error);
        this.isNowUser = false;
      }
    },
    verifyLoginStatus() { // 新增方法以验证登录状态
      checkToken(this.$router).then(valid => {
        this.isLoggedIn = valid;
      }).catch(() => {
        this.isLoggedIn = false;
      });
    },
    async getSupportsList() {
      try {        
        const token = localStorage.getItem('token')
        const { data } = await this.$axios.get(`http://localhost:8080/support/list/${this.$route.params.id}`,{
          headers: { token },
        });
        if (data.code === 200) {
          this.supportsList = data.data;
        } else {
          this.$message.error('未能获取关联的支持信息');
        }
      } catch (error) {
        console.error('获取支持列表失败:', error);
        this.$message.error('获取支持列表失败');
      }
    },
    navigateToSupportDetail(sid) {
      this.$router.push({ path: `/town-support-detail/${sid}` });
    },
    editPromotional() {
      this.$router.push({ path: `/editPromotional/${this.promotional.pid}` });
    },
    deletePromotional() {
      this.$confirm('确定要删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const token = localStorage.getItem('token');
        this.$axios.delete(`http://localhost:8080/publicize/delete/${this.promotional.pid}`, {
          headers: { 'token': token },
          params: { userId: this.promotional.puserid}
        })
          .then(response => {
            if (response.data.code === 200) {
              this.$message.success('删除成功');
              this.$router.push('/town-promotional-list');
            } else {
              this.$message.error(response.data.message || '删除失败');
            }
          })
          .catch(error => {
            this.$message.error('请求失败');
            console.error(error);
          });
      }).catch(() => {
        // 取消删除
      });
    },
    addSupport() {
      this.$router.push({ path: `/addsupport/${this.promotional.pid}` });
    },
    getFirstImage(fileList) {
      if (!fileList) return '';
      const images = fileList.split(',');
      return images[0] || '';
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
  }
};
</script>

<style scoped>
.detail-container {
  padding: 20px;
}
.media-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.image-item {
  width: calc(33.33% - 10px);
  height: auto;
  margin-right: 10px;
  margin-bottom: 10px;
}
.image-item:nth-child(3n) {
  margin-right: 0;
}
.video-item {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
}
.associated-supports {
  margin-top: 40px;
}
.associated-supports h3 {
  margin-bottom: 20px;
}
</style>