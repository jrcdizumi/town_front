<template>
    <div class="form-container">
      <el-form :model="form" ref="form" label-width="120px">

          <!-- 三级级联选择器：省份、城市、乡镇 -->
        <el-form-item label="地址">
            <el-cascader :options="provinces" placeholder="请选择省份/城市/乡镇" v-model="form.address" clearable
            :props="{
            expandTrigger: 'hover',
            children: 'children',
            emitPath: true, // 设置为false，只返回最后一级的标签
            showAllLevels: false ,
            value: 'label'
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
        },
         // 三级联动数据
         provinces: [
        {
            label: '北京市',
            children: [
                {
                    label: '东城区',
                    children: [
                        { label: '药王店' },
                        { label: '天坛' }
                    ]
                },
                {
                    label: '海淀区',
                    children: [
                        { label: '五道口' },
                        { label: '知春路' }
                    ]
                }
            ]
        },
        {
            label: '广东省',
            children: [
                {
                    label: '广州市',
                    children: [
                        { label: '天河区' },
                        { label: '越秀区' }
                    ]
                },
                {
                    label: '深圳市',
                    children: [
                        { label: '南山区' },
                        { label: '福田区' }
                    ]
                }
            ]
        }
         ],
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
    methods: {
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
            console.log('表单数据:', this.form);
            
            // 这里可以添加表单提交逻辑，例如使用 axios 发送请求
            // this.$axios.post('/api/submit', this.form).then(response => {
            //   // 处理响应
            // }).catch(error => {
            //   this.$message.error('提交失败');
            // });
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