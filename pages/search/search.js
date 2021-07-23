import request from '../../utils/request'
let isSend = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder的内容
    hotList: '',  //热搜榜数据
    searchContent: '', //表单数据
    searchList: '',//模糊匹配的数据
    historyList: [], //搜索历史数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData()
    this.getSearchHistory()
  },

  // 获取初始化数据
  async getInitData(){
    //获取placeholderData数据
    let placeholderData = await request('/search/default')
    //获取热搜榜数据
    let hotListData = await request('/search/hot/detail')
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },

  //获取本地历史记录
  getSearchHistory(){
    let historyList = wx.getStorageSync('searchHistory')
    if(historyList){
      this.setData({
        historyList
      })
    }
  },

  //表单项内容发生改变
  handleInputChange(event){
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if(isSend){
      return
    }
    isSend = true 
    //函数节流

    setTimeout(async () => {
      if(!this.data.searchContent){
        this.setData({
          searchList: []
        })
        isSend = false
        return
      }
      //获取关键字
      let {searchContent, historyList} = this.data
      let searchListData = await request('/search', {keywords: searchContent, limit: 10})
      this.setData({
        searchList: searchListData.result.songs
      })
      isSend = false

      //将搜索的关键字添加到搜索历史记录中
      if(historyList.indexOf(searchContent) !== -1){
        historyList.splice(historyList.indexOf(searchContent), 1)
      }
      historyList.unshift(searchContent)
      this.setData({
        historyList
      })

      wx.setStorageSync('searchHistory', historyList)
    },400)
  },

  //清空搜索内容
  clearSearchContent(){
    this.setData({
      searchContent: '',
      searchList: []
    })
  } ,

  //删除历史记录
  deleteSearchHistory(){
    wx.showModal({
      content: '确认删除吗',
      success: (res) => {
         if(res.confirm){
            //清空data中history
            this.setData({
              historyList: []
            })
            //清除本地历史缓存记录
            wx.removeStorageSync('searchHistory')
         }
      }
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