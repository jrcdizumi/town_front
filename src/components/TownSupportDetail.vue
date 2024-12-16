<template>
    <div class="detail-container">
      <el-card>
        <div class="header" style="display: flex; justify-content: space-between;">
          <h2>{{ support.stitle }}</h2>
          <p v-if="promotionTitle">
            关联的宣传标题:
            <el-link type="primary" @click="navigateToPromotion">{{ promotionTitle }}</el-link>
          </p>
          <div>
            <el-button v-if="isNowUser" type="primary" @click="editSupport">修改</el-button>
            <el-button v-if="isNowUser" type="danger" @click="deleteSupport">删除</el-button>
          </div>
        </div>
        <p>描述: {{ support.sdesc }}</p>
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
        <video
          v-if="support.videourl"
          :key="support.videourl"
          class="video-item"
          controls
          autoplay="false"
          preload="auto"
        >
          <source :src="support.videourl" type="video/mp4" />
        </video>
      </el-card>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        support: {},       // 包含 TownSupport 类的所有属性
        isNowUser: false,
        promotionTitle: '', // 关联的宣传标题
      };
    },
    created() {
      this.loadInitialData();
    },
    methods: {
      async loadInitialData() {
        this.getDetail()
          .then(() => {
            console.log('数据加载成功');
            this.checkSameUser();
            this.getPromotionTitle();
          })
          .catch((error) => {
            console.error('数据加载失败:', error);
            this.loadError = true;
            this.$message.error('数据加载失败，请刷新页面重试。');
          });
      },
      async getPromotionTitle() {
        try {
          const { data } = await this.$axios.get('http://localhost:8080/publicize/detail', {
            params: { id: this.support.pid },
          });
          if (data.code === 200) {
            this.promotionTitle = data.data.ptitle;
          } else {
            this.promotionTitle = '未找到对应的宣传信息';
          }
        } catch (error) {
          console.error('获取宣传标题失败:', error);
          this.promotionTitle = '获取宣传标题失败';
        }
      },
      async getDetail() {
        const id = this.$route.params.id;
        try {
          const { data } = await this.$axios.get(`http://localhost:8080/support/detail/${id}`);
          if (data.code === 200) {
            this.support = data.data;  // 直接赋值获取的支持详情
          } else if (data.code === 400) {
            this.$message.error('数据不存在');
            this.support = {};
          }
        } catch (error) {
          this.$message.error('请求失败');
          this.support = {};
        }
      },
      async checkSameUser() {
        try {
          const token = localStorage.getItem('token');
          const response = await this.$axios.get('http://localhost:8080/user/checkSameUser', {
            params: { userId: this.support.suserId },
            headers: { token },
          });
          this.isNowUser = response.data.code === 200;
        } catch (error) {
          console.error('用户验证失败:', error);
          this.isNowUser = false;
        }
      },
      navigateToPromotion() {
        // 使用路由跳转到宣传详情页面，假设路由路径为 /town-promotional-detail/:id
        this.$router.push({ path: `/town-promotional-detail/${this.support.pid}` });
      },
      editSupport() {
        this.$router.push({ path: `/editSupport/${this.support.sid}` });
      },
      deleteSupport() {
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            const token = localStorage.getItem('token');
            this.$axios
              .delete(`http://localhost:8080/support/delete/${this.support.sid}`, {
                headers: { token },
                params: { userId: this.support.suserId },
              })
              .then((response) => {
                if (response.data.code === 200) {
                  this.$message.success('删除成功');
                  this.$router.push('/town-support-list');
                } else {
                  this.$message.error(response.data.message || '删除失败');
                }
              })
              .catch((error) => {
                this.$message.error('请求失败');
                console.error(error);
              });
          })
          .catch(() => {
            // 取消删除
          });
      },
    },
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
  </style>