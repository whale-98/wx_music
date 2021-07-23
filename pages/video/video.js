import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    navId:'', //导航标识
    videoList: [], //视频列表数据
    videoId: '', //视频id标识
    videoUpdateTime: [],//记录video播放时长
    isTriggered: false, //标识下拉刷新是否触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航数据
    this.getVideoGroupListData()
  },

  //获取导航数据
  async getVideoGroupListData(){
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getVideoList(this.data.navId)
  },

  //获取视频列表数据
  async getVideoList(navId){
    let videoListData = await request('/video/group/',{id: navId}) 
    //关闭微信提示框
    wx.hideLoading()
    //关闭下拉刷新
    this.setData({
      isTriggered: false
    })
    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++
      return item
    })
    this.setData({
      videoList
    })
  },

  //切换标签
  changeNav(event){
    let navId = event.currentTarget.id
    this.setData({
      navId: navId*1,
      videoList: ''
    })
    //显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    //动态获取当前导航对应的视频数据
    this.getVideoList(navId)
  },

  //点击播放/继续播放回调
  handlePlay(event){
    let vid = event.currentTarget.id
    //关闭上一个播放的视频
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid

    //跟新data中videoId的状态数据
    this.setData({
      videoId: event.currentTarget.id
    })
    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid) 
    //判断之前视频是否播放，若有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data
    let videoItem =  videoUpdateTime.find(item => item.vid === vid)
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime)
    }
    // this.videoContext.play()
  },

  //监听视频播放进度回调
  handleTimeUpdate(event){
    let videoTimeObj = {vid: event.currentTarget.id, currentTime: event.detail.currentTime}
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    if(videoItem){
      videoItem.currentTime = event.detail.currentTime
    }else{
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },

  //视频结束回调
  handleEnded(event){
    let {videoUpdateTime} = this.data
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1)
    this.setData({
      videoUpdateTime
    })
  },

  //下拉刷新回调
  handleRefresher(){
    //开启下拉刷新
    this.setData({
      isTriggered: true
    })
    this.getVideoList(this.data.navId)
  },
  
  //上拉加载
  handleToLower(){
    let videoList = this.data.videoList
    videoList.push(...videoList)
    this.setData({
      videoList
    })
  },
  
  //跳转搜索
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    if(from === 'button'){
      return{
        title: '来自Button的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }else{
      return{
        title: '来自menu的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }
  }
})