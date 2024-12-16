<template>
  <div class="form-container">
    <el-form :model="form" ref="form" label-width="120px">

      <!-- 移除级联选择器和扶持类型选择器 -->
      
      <el-form-item label="扶持主题名称">
        <el-input v-model="stitle"></el-input>
      </el-form-item>
      <el-form-item label="扶持描述">
        <el-input v-model="sdesc" type="textarea"></el-input>
      </el-form-item>

      <!-- 上传图片 -->
      <el-form-item label="图片">
        <el-upload
          class="upload-demo"
          :before-upload="beforeUpload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="imageList"
          list-type="picture"
          :http-request="customHttpRequest">
          <el-button size="small" type="primary">点击上传</el-button>
          <template v-slot:tip>
            <div class="el-upload__tip">只能上传jpg/png文件，且不超过1MB</div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 预览弹窗 -->
      <!-- ...existing code... -->

      <!-- 上传视频介绍 -->
      <p class="upload-intro">上传视频介绍</p>
      <el-upload
        class="upload-demo"
        drag
        multiple
        list-type="text"
        :http-request="customVideoHttpRequest"
        limit=1
        :on-exceed="handleExceedLimit"
        :file-list="videoList"
        :before-upload="beforeVideoUpload">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
      </el-upload>

      <el-form-item label="关联宣传ID">
        <el-input v-model="pid" disabled></el-input>
      </el-form-item>

      <el-form-item style="text-align: center;">
        <el-button type="primary" @click="submitEdit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sid: '',
      suserId: '',
      pid: '',
      stitle: '',
      sdesc: '',
      sfileList: '',
      videourl: '',
      imageList: [],
      videoList: [],
      isPreviewVisible: false,
      previewUrl: '',
      // 移除 provinces, supportTypes, address 相关数据
    };
  },
  created() {
    this.initializeData();
  },
  methods: {
    async initializeData() {
      const id = this.$route.params.sid;
      try {
        const detailResponse = await this.$axios.get('http://localhost:8080/support/detail', {
          params: { id },
        });
        if (detailResponse.data.code === 200) {
          const data = detailResponse.data.data;
          this.sid = data.sid;
          this.suserId = data.suserId;
          this.pid = data.pid;
          this.stitle = data.stitle;
          this.sdesc = data.sdesc;
          this.sfileList = data.sfileList;
          this.videourl = data.videourl;

          // 解析并设置 imageList
          if (this.sfileList) {
            this.imageList = this.sfileList.split(',').map((url, index) => ({
              name: `image_${index + 1}.jpg`,
              url: url.trim(),
              status: 'success',
            }));
          }

          // 解析并设置 videoList
          if (this.videourl) {
            this.videoList = [{
              name: 'video.mp4',
              url: this.videourl,
              status: 'success',
            }];
          }
        } else {
          this.$message.error('获取详情失败');
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
        this.$message.error('初始化数据失败');
      }
    },
    // 移除 findTownPath 和 findTownID 方法
    async submitEdit() {
      try {
        const confirmResult = await this.$confirm('确定要提交修改吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        if (confirmResult !== 'confirm') {
          return;
        }

        const token = localStorage.getItem('token');

        // 处理 imageList 和 videoList
        const imageUrls = this.imageList.map(item => item.url).join(',');
        const videoUrl = this.videoList.length > 0 ? this.videoList[0].url : '';

        const payload = {
          sid: this.sid,
          suserId: this.suserId,
          pid: this.pid,
          stitle: this.stitle,
          sdesc: this.sdesc,
          sfileList: imageUrls,
          videourl: videoUrl,
          // 不需要提交 supportDate, updateDate, supportState
        };

        const wrappedPayload = {
          data: payload,
        };

        const response = await this.$axios.put('http://localhost:8080/support/update', wrappedPayload, {
          headers: { token },
        });

        if (response.data.code === 200) {
          this.$message.success('修改成功');
          this.$router.push(`/town-support-detail/${this.sid}`);
        } else {
          this.$message.error(response.data.message || '修改失败');
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消修改',
          });
          return;
        }
        console.error('修改失败:', error);
        this.$message.error('修改请求失败');
      }
    },
    cancel() {
      this.$router.push(`/detail/${this.sid}`);
    },
    handlePreview(file) {
      this.previewUrl = file.url;
      this.isPreviewVisible = true;
    },
    customHttpRequest({onSuccess, onError, file}) {
      const formData = new FormData();
      formData.append('file', file);
      this.$axios.post('http://localhost:8080/support/uploadImage', formData)
        .then(response => {
          if (response.data.code === 200) {
            this.$message.success('上传成功');
            this.imageList.push({ uid: file.uid, url: response.data.data });
            onSuccess(response);
          } else {
            this.$message.error('上传失败');
            onError('后端接口上传失败');
          }
        })
        .catch(error => {
          onError(error);
        });
    },
    customVideoHttpRequest({onSuccess, onError, file}) {
      const formData = new FormData();
      formData.append('file', file);
      this.$axios.post('http://localhost:8080/support/uploadVideo', formData)
        .then(response => {
          if (response.data.code === 200) {
            this.$message.success('视频上传成功');
            this.videoList.push({ uid: file.uid, url: response.data.data });
            onSuccess(response);
          } else {
            this.$message.error('视频上传失败');
            onError('后端接口上传失败');
          }
        })
        .catch(error => {
          onError(error);
        });
    },
    beforeVideoUpload(file) {
      const isVideo = file.type === 'video/mp4';
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isVideo) {
        this.$message.error('上传视频格式不正确');
      }
      if (!isLt10M) {
        this.$message.error('上传视频大小不能超过 10MB');
      }
      return isVideo && isLt10M;
    },
    handleExceedLimit(files, fileList) {
      this.$message.warning('只能上传一个视频');
    },
    handleRemove(file) {
      const removedFileIndex = this.imageList.findIndex(item => item.uid === file.uid);
      if (removedFileIndex !== -1) {
        this.imageList.splice(removedFileIndex, 1);
        this.$message.success('已删除图片');
      }
    },
  }
};
</script>

<style scoped>
/* ...existing code... */
</style>
