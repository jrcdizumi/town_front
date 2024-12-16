<template>
    <div class="form-container">
        <el-form :model="form" ref="form" label-width="120px">
            
            <el-form-item label="助力主题名称" :rules="[ { required: true, message: '请输入助力主题名称', trigger: 'blur' } ]">
                <el-input v-model="form.stitle"></el-input>
            </el-form-item>

            <el-form-item label="关联宣传">
                <el-input v-model="promotionTitle" disabled>
                    <template #append>
                        <el-link type="primary" @click="navigateToPromotion">查看详情</el-link>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item label="助力描述" :rules="[ { required: true, message: '请输入助力描述', trigger: 'blur' } ]">
                <el-input v-model="form.sdesc" type="textarea"></el-input>
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

            <el-form-item label="上传视频介绍">
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
            </el-form-item>

            <el-form-item style="text-align: center;">
                <el-button type="primary" @click="submitAdd">提交</el-button>
                <el-button @click="cancel">取消</el-button>
            </el-form-item>
        </el-form>

        <el-dialog :visible.sync="isPreviewVisible" width="50%">
            <img :src="previewUrl" alt="预览" style="width: 100%">
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                stitle: '',
                sdesc: '',
            },
            imageList: [],
            videoList: [],
            isPreviewVisible: false,
            previewUrl: '',
            promotionTitle: '',
        };
    },
    methods: {
        async initializeData() {
            // Initialize any necessary data if required
            // 通过路由参数获取pid
            this.pid = this.$route.params.pid;
            this.getPromotionTitle(); // 调用获取宣传标题的方法
        },
        async getPromotionTitle() {
            try {
                const { data } = await this.$axios.get('http://localhost:8080/publicize/detail', {
                    params: { id: this.pid },
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
        navigateToPromotion() {
            this.$router.push({ path: `/town-promotional-detail/${this.pid}` });
        },
        async submitAdd() {
            try {
                // 添加确认对话框
                await this.$confirm('确定要提交添加吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                });

                await this.$refs.form.validate();
                const token = localStorage.getItem('token');

                const imageUrls = this.imageList.map(item => item.url).join(',');
                const videoUrl = this.videoList.length > 0 ? this.videoList[0].url : '';

                const payload = {
                    pid: this.pid, // 使用路由参数中的pid
                    stitle: this.form.stitle,
                    sdesc: this.form.sdesc,
                    sfileList: imageUrls,
                    videourl: videoUrl,
                };

                const response = await this.$axios.post('http://localhost:8080/support/submit', payload, {
                    headers: { token },
                });

                if (response.data.code === 200) {
                    this.$message.success('添加成功');
                    this.resetForm(); // 重置表单
                    this.$router.push('/town-support-list');
                } else {
                    this.$message.error(response.data.message || '添加失败');
                }
            } catch (error) {
                if (error === 'cancel') {
                    this.$message.info('已取消添加');
                } else {
                    this.$message.error('提交失败');
                }
            }
        },
        resetForm() {
            this.$refs.form.resetFields();
            this.form.stitle = '';
            this.form.sdesc = '';
            this.imageList = [];
            this.videoList = [];
            this.promotionTitle = '';
        },
        cancel() {
            this.$router.push('/town-support-list');
        },
        handlePreview(file) {
            this.previewUrl = file.url;
            this.isPreviewVisible = true;
        },
        customHttpRequest({ onSuccess, onError, file }) {
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
        customVideoHttpRequest({ onSuccess, onError, file }) {
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
        beforeUpload(file) {
            const isImage = ['image/jpeg', 'image/png'].includes(file.type);
            const isLt1M = file.size / 1024 / 1024 < 1;

            if (!isImage) {
                this.$message.error('上传图片格式不正确');
            }
            if (!isLt1M) {
                this.$message.error('上传图片大小不能超过 1MB');
            }
            return isImage && isLt1M;
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
    },
    created() {
        this.initializeData();
    },
};
</script>

<style scoped>
.form-container {
    padding: 20px;
}
.upload-demo {
    border: 1px dashed #d9d9d9;
    padding: 20px;
    cursor: pointer;
}
.upload-intro {
    margin-bottom: 10px;
}
</style>