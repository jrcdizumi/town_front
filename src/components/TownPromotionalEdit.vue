<template>
    <div class="form-container">
      <el-form :model="form" ref="form" label-width="120px">

          <!-- 三级级联选择器：省份、城市、乡镇 -->
          <el-form-item label="乡镇">
            <el-cascader :options="provinces" placeholder="请选择省份/城市/乡镇" v-model="this.address" clearable
            :props="{
            expandTrigger: 'hover',
            children: 'children',
            emitPath: true, // 设置为false，只返回最后一级的标签
            showAllLevels: true ,
            value: 'label'
            }"
            ></el-cascader>
        </el-form-item>
        
    
        <el-form-item label="宣传类型">
          <el-select v-model="ptypeId" placeholder="请选择宣传类型">
            <el-option
              v-for="type in promotionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="宣传主题名称">
          <el-input v-model="ptitle"></el-input>
        </el-form-item>
        <el-form-item label="宣传描述">
          <el-input v-model="pdesc" type="textarea"></el-input>
        </el-form-item>
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
        <el-dialog v-model="isPreviewVisible" width="50%">
          <template #title>
            <span>图片预览</span>
          </template>
          <img :src="previewUrl" alt="预览图片" style="width: 100%;">
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="isPreviewVisible = false">关闭</el-button>
            </span>
          </template>
        </el-dialog>

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
            :before-upload="beforeVideoUpload"
            :on-remove="handleVideoRemove"
        >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
        </el-upload>
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
      pid: '',
      ptitle: '',
      townID: '',
      ptypeId: '',
      pdesc: '',
      pfileList: '',
      videourl: '',
      puserid: '',
      promotionTypes: [], 
      provinces: [],
      fileList: [],
      address: [],
      imageList: [], // 新增：存储图片文件列表
      videoList: [], // 新增：存储视频文件列表
      isPreviewVisible: false, // 修改：初始为 false，控制预览弹窗的显示
      previewUrl: '',          // 新增：存储预览图片的URL
    };
  },
  created() {
    this.initializeData();
  },
  methods: {
    async initializeData() {
      const id = this.$route.params.pid;
      try {
        const detailResponse = await this.$axios.get('http://localhost:8080/publicize/detail', {
          params: { id }
        });
        if (detailResponse.data.code === 200) {
          const data = detailResponse.data.data;
          this.pid = data.pid;
          this.ptitle = data.ptitle;
          this.ptypeId = data.ptypeId;
          this.puserid = data.puserid;
          this.townID = data.townID;
          this.pdesc = data.pdesc;
          this.pfileList = data.pfileList;
          this.videourl = data.videourl;
          console.log("townID", this.townID);

          // 解析并设置 imageList
          if (this.pfileList) {
            this.imageList = this.pfileList.split(',').map((url, index) => ({
              name: `image_${index + 1}.jpg`, // 根据实际情况调整文件名
              url: url.trim(),
              status: 'success',
            }));
          }

          // 解析并设置 videoList
          if (this.videourl) {
            this.videoList = [{
              name: 'video.mp4', // 根据实际情况调整文件名
              url: this.videourl,
              status: 'success',
            }];
          }
        } else {
          this.$message.error('获取详情失败');
        }

        const townsResponse = await this.$axios.get('http://localhost:8080/publicize/getTownList');
        if (townsResponse.data.code === 200) {
            this.provinces = JSON.parse(townsResponse.data.data);
            console.log(this.provinces);
            //通过townID查询地址赋值给address
            this.address = this.findTownPath(this.provinces, this.townID);
            console.log("address", this.address);
        } else {
          this.$message.error('获取乡镇信息失败');
        }

        const typesResponse = await this.$axios.get('http://localhost:8080/publicize/getTypeList');
        if (typesResponse.data.code === 200) {
          const typesData = typesResponse.data.data;
          this.promotionTypes = Object.keys(typesData).map(key => ({
            label: key,
            value: typesData[key],
          }));
        } else {
          this.$message.error('获取宣传类型失败');
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
        this.$message.error('初始化数据失败');
      }
    },
    findTownPath(provinces, targetTownID) {
      for (const province of provinces) {
        for (const city of province.children) {
          for (const town of city.children) {
            console.log("town",town);
            if (town.value == targetTownID) {
              console.log("命中");  
              return [province.label, city.label, town.label];
            }
          }
        }
      }
      return [];
    },
    findTownID(provinces, address) {
      console.log("address",address);
      if (address.length !== 3) return null;
      const [provinceLabel, cityLabel, townLabel] = address;
      for (const province of provinces) {
        console.log("province",province);
        if (province.label === provinceLabel) {
          for (const city of province.children) {
            console.log("city",city);
            if (city.label == cityLabel) {
              for (const town of city.children) {
                console.log("town",town);
                if (town.label == townLabel) {
                  return town.value;
                }
              }
            }
          }
        }
      }
      return null;
    },
    async submitEdit() {
      try {
        // 添加确认对话框
        const confirmResult = await this.$confirm(
          '确定要提交修改吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (confirmResult !== 'confirm') {
          return;
        }

        const token = localStorage.getItem('token');
        // 通过address查找对应的townID
        const newTownID = this.findTownID(this.provinces, this.address);
        if (!newTownID) {
          this.$message.error('请选择有效的乡镇地址');
          return;
        }
        this.townID = newTownID;

        // 处理 imageList 和 videoList
        const imageUrls = this.imageList.map(item => item.url).join(',');
        const videoUrl = this.videoList.length > 0 ? this.videoList[0].url : '';

        const payload = {
          ptitle: this.ptitle,
          pdesc: this.pdesc,
          pfileList: imageUrls,
          pstate: 0, // 状态设为已发布
          ptypeId: this.ptypeId,
          videourl: videoUrl, // 添加视频链接参数
          townID: this.townID,
          puserid: this.puserid,
          pid:this.pid
        };
        console.log("提交的数据为：", payload);
        
        const wrappedPayload = {
          data: payload
        };
        
        const response = await this.$axios.put('http://localhost:8080/publicize/update', wrappedPayload, {
          headers: { 'token': token }
        });
        
        if (response.data.code === 200) {
          this.$message.success('修改成功');
          this.$router.push(`/town-promotional-detail/${this.pid}`);
        } else {
          this.$message.error(response.data.message || '修改失败');
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消修改'
          });
          return;
        }
        console.error('修改失败:', error);
        this.$message.error('修改请求失败');
      }
    },
    async submitForm() {
      try {
        // 添加确认对话框
        const confirmResult = await this.$confirm(
          '确定要提交添加吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (confirmResult !== 'confirm') {
          return;
        }

        // 打印所有表单值
        this.form.fileList = this.fileList;
        this.form.townID = this.form.address[this.form.address.length - 1];
        console.log('表单数据:', this.form);
        
        // 校验表单字段是否为空
        if (!this.form.townID || !this.form.promotionType || !this.form.promotionTitle || !this.form.promotionDescription) {
          this.$message.error('乡镇名、宣传类型、主题名称、描述均不能为空');
          return;
        }

        // 构造提交数据
        const submitData = {
          ptitle: this.form.promotionTitle,
          pdesc: this.form.promotionDescription,
          pfileList: this.form.fileList.map(item => item.url).join(','),
          pstate: 0,
          ptypeId: this.form.promotionType,
          videourl: this.form.videoUrl,
          townID: this.form.townID
        };
        console.log('提交数据:', submitData);
        
        // 获取token并发送请求
        const token = localStorage.getItem('token');
        const response = await this.$axios.post('http://localhost:8080/publicize/submit', submitData, {
          headers: {
            token: `${token}`
          }
        });

        if (response.data.code === 200) {
          this.$message.success('提交成功');
          this.resetForm();
        } else {
          this.$message.error(`提交失败: ${response.data.message || '未知错误'}`);
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message({
            type: 'info',
            message: '已取消添加'
          });
          return;
        }
        console.error('提交错误:', error);
        this.$message.error('提交失败，请稍后再试');
      }
    },
    cancel() {
      this.$router.push(`/detail/${this.pid}`);
    },
    /**
     * 处理预览事件
     * @param {Object} file - 被预览的文件对象
     */
    handlePreview(file) {
      console.log("handlePreview",file);
      this.previewUrl = file.url;
      this.isPreviewVisible = true;
    },
    customHttpRequest({onSuccess, onError, file}) {
      const formData = new FormData();
      formData.append('file', file);
      this.$axios.post('http://localhost:8080/publicize/uploadImage', formData)
        .then(response => {
          if(response.data.code === 200) {
            this.$message.success('上传成功');
            this.imageList.push({uid: file.uid, url: response.data.data});
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
      this.$axios.post('http://localhost:8080/publicize/uploadVideo', formData) // 修改：上传视频的接口
        .then(response => {
          if(response.data.code === 200) {
            this.$message.success('视频上传成功');
            this.videoList.push({uid: file.uid, url: response.data.data});
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
    handleVideoRemove(file) {
      this.videoList = [];
      this.$message.success('已删除视频');
    },
  }
};
</script>

<style scoped>
.edit-container {
  padding: 20px;
}
</style>