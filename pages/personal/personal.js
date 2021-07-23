let startY = 0;
let moveY = 0;
let moveDistance = 0;

import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coverTransition: '',
    userInfo:'',  //用户信息
    recentPlayList: []  //用户播放历史列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户基本信息
    let userInfo = JSON.parse(wx.getStorageSync('userInfo'))
    if(userInfo){
      this.setData({
        userInfo
      })
      this.getUserRecentPlayList(userInfo.userId)
    }
  },

  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record',{uid: userId,type: 0})
    // 添加对象列表唯一表示
    let index = 0
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList: recentPlayList
    })
  },

  handleTouchStart(event){
    //获取手指起始坐标
    startY = event.touches[0].clientY,
    this.setData({
      coverTransition: ''
    })
  },
  handleTouchMove(event){
    moveY = event.touches[0].clientY
    moveDistance = moveY - startY
    if (moveDistance<=0){
      return
    }
    if(moveDistance >= 80){
      moveDistance = 80
    }
    /*动态跟新transform状态值*/
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd(){
    this.setData({
      coverTransform: `translateY(0rpx)`,
      coverTransition: 'transform 0.5s linear'
    })
  },

  //跳转登录页面回调
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
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
  onShareAppMessage: function () {

  }
})
