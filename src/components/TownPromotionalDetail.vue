<template>
  <div class="detail-container">
    <el-card>
      <h2>{{ promotional.ptitle }}</h2>
      <p>类型ID: {{ promotional.ptypeId }}</p>
      <p>描述: {{ promotional.pdesc }}</p>
      <p>图片列表:</p>
      <el-image
        v-for="url in promotional.pfileList.split(',')"
        :key="url"
        :src="url"
        style="width: 100px; height: 100px; margin-right: 10px"
      ></el-image>
      <p>视频链接: <a :href="promotional.videourl" target="_blank">{{ promotional.videourl }}</a></p>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      promotional: {}
    };
  },
  created() {
    const id = this.$route.params.id;
    // 模拟获取详情数据
    this.promotional = {
      pid: id,
      ptitle: 'test3',
      ptypeId: 3,
      puserid: 4,
      townID: 0,
      pdesc: 'test3',
      pfileList: 'https://sky-take-out-1317682162.cos.ap-beijing.myqcloud.com/goodtown/b989aba8-5ce5-4f26-82d8-3822200742ab.png',
      pbegindate: '2024-12-08 17:26:11',
      pstate: 0,
      pupdatedate: '2024-12-08 17:26:11',
      videourl: ''
    };
  }
};
</script>

<style scoped>
.detail-container {
  padding: 20px;
}
</style>