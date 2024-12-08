<template>
    <div class="form-container">
      <el-form :model="form" ref="form" label-width="120px">

          <!-- 三级级联选择器：省份、城市、乡镇 -->
        <el-form-item label="乡镇">
            <el-cascader :options="provinces" placeholder="请选择省份/城市/乡镇" v-model="form.address" clearable
            :props="{
            expandTrigger: 'hover',
            children: 'children',
            emitPath: true, // 设置为false，只返回最后一级的标签
            showAllLevels: false ,
            value: 'value'
            }"
            ></el-cascader>
        </el-form-item>
        
    
        <el-form-item label="宣传类型">
          <el-select v-model="form.promotionType" placeholder="请选择宣传类型">
            <el-option
              v-for="type in promotionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="宣传主题名称">
          <el-input v-model="form.promotionTitle"></el-input>
        </el-form-item>
        <el-form-item label="宣传描述">
          <el-input v-model="form.promotionDescription" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="图片">
            <el-upload
            class="upload-demo"
            :before-upload="beforeUpload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            list-type="picture"
            :http-request="customHttpRequest">
            <el-button size="small" type="primary">点击上传</el-button>
            <template v-slot:tip>
              <div class="el-upload__tip">只能上传jpg/png文件，且不超过1MB</div>
            </template>
            </el-upload>
        </el-form-item>
        <p class="upload-intro">上传视频介绍</p>
        <el-upload
            class="upload-demo"
            drag
            multiple
            list-type="text"
            :http-request="customVideoHttpRequest"
            limit=1
            :on-exceed="handleExceedLimit"
        >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <el-form-item style="text-align: center;">
            <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          address: [],
          promotionType: '',
          promotionTitle: '',
          promotionDescription: '',
          videoUrl: '',
          fileList: [],
          townID:''
        },
        provinces: [], // 初始化为空数组，后续通过接口获取数据
        fileList: [], // 初始化文件列表为空，后续上传成功后会添加元素进来
        acceptFileType: ['image/jpeg', 'image/png'], // 定义可接受的文件类型
        maxFileSize: 1024 * 1024, // 1MB
        promotionTypes: [ // 示例宣传类型数据
        { value: 'type1', label: '类型1' },
        { value: 'type2', label: '类型2' },
        { value: 'type3', label: '类型3' },
      ],
      };
    },
    created() {
      this.loadInitialData();
    },
    methods: {
        loadInitialData() {
          // 需要加载省份和宣传类型的数据
          Promise.all([
            this.fetchTowns(), // 调用获取乡镇信息的函数
            this.fetchPromotionTypes()
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
        beforeUpload(file) {
            console.log(file.type);
            const isValidType = this.acceptFileType.includes(file.type);
            if (!isValidType) {
                this.$message.error('只能上传jpg/png文件');
                return false;
            }
            const isValidSize = file.size <= this.maxFileSize;
            if (!isValidSize) {
                this.$message.error('文件大小不能超过500KB');
                return false;
            }
            return true;
        },
        customHttpRequest({onSuccess, onError, file}) {
         const formData = new FormData();
         formData.append('file', file);
         this.$axios.post('http://localhost:8080/publicize/uploadImage', formData)
          .then(response => {
            console.log(response)
            console.log(file)
            if(response.data.code === 200) {
                this.$message.success('上传成功');
                this.fileList.push({uid:file.uid,  url: response.data.data});
                console.log(this.fileList);
                onSuccess(response);
            }
            else{
                this.$message.error('上传失败');
                onError(后端接口上传失败);
            }
           })
          .catch(error => {
             onError(error);
            });
       },
       customVideoHttpRequest({onSuccess, onError, file}) {
         const formData = new FormData();
         formData.append('file', file);
         this.$axios.post('http://localhost:8080/publicize/uploadVideo', formData)
          .then(response => {
            console.log(response)
            console.log(file)
            if(response.data.code === 200) {
                this.$message.success('上传成功');
                this.form.videoUrl = response.data.data;
                console.log(this.fileList);
                onSuccess(response);
            }
            else{
                this.$message.error('上传失败');
                onError(后端接口上传失败);
            }
           })
          .catch(error => {
             onError(error);
            });
       },
       handleRemove(file) {
            const removedFileIndex = this.fileList.findIndex(item => item.uid === file.uid);
            if (removedFileIndex !== -1) {
                // 从fileList中移除文件
                this.fileList.splice(removedFileIndex, 1);
                this.$message.success('已删除图片');
            }
            console.log(this.fileList);
        },
        submitForm() {
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
              pstate: 0, // 状态设为已发布
              ptypeId: this.form.promotionType,
              videourl: this.form.videoUrl, // 添加视频链接参数
              townID: this.form.townID
            };
            console.log('提交数据:', submitData);
            // 获取token
            const token = localStorage.getItem('token');
            // 发送POST请求到后端
            this.$axios.post('http://localhost:8080/publicize/submit', submitData, {
                headers: {
                    token: `${token}`
                }
            })
            .then(response => {
              if (response.data.code === 200) {
                this.$message.success('提交成功');
                // 重置表单
                this.resetForm();
              } else {
                this.$message.error(`提交失败: ${response.data.message || '未知错误'}`);
              }
            })
            .catch(error => {
              console.error('提交错误:', error);
              // this.$message.error('提交失败，请稍后再试');
            });
        },
        handleExceedLimit(files, fileList) {
        this.$message.error('超过文件上线，请先删除部分文件再上传');
        // 可以在这里做更多逻辑处理，比如阻止多余文件继续添加到文件列表等
        // 例如，若想清空多余文件的选择，可以尝试如下代码（根据实际情况可能需要调整）
        // this.$refs.upload.clearFiles();
        }
    },
  };
  </script>
  
  <style scoped>
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .el-form {
    width: 100%;
    max-width: 600px;
  }
  </style>