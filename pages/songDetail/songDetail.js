import request from '../../utils/request'
import PubSub from 'pubsub-js'
import moment from 'moment'

//创建全局实例
const appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,  //音乐是否播放
    song: {}, //歌曲详情
    musicId: '', //音乐id
    currentTime: '00:00', //实时时长
    durationTime: '00:00', //总时长
    currentWidth: 0,  //进度条长度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let musicId = options.musicId
    this.setData({
      musicId
    })
    this.getMusicInfo(musicId)
    
    //判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      this.setData({
        isPlay: true
      })
    }

    this.backgroundAudioManger = wx.getBackgroundAudioManager()
    this.backgroundAudioManger.onPlay(() => {
      this.changePlayState(true)
      //修改全局音乐播放状态
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManger.onPause(() => {
      this.changePlayState(false)
    })
    this.backgroundAudioManger.onStop(() => {
      this.changePlayState(false)
    })

    //监听音乐播放自然结束
    this.backgroundAudioManger.onEnded(() => {
      PubSub.publish('switchType', 'next')
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })

    //监听音乐实时播放进度
    this.backgroundAudioManger.onTimeUpdate(() => {
      let currentTime = moment(this.backgroundAudioManger.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManger.currentTime/this.backgroundAudioManger.duration*450
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },

  //修改播放状态的功能函数
  changePlayState(isPlay){
    this.setData({
      isPlay
    })
    appInstance.globalData.isMusicPlay = isPlay
  },
  
  //获取音乐详情
  async getMusicInfo(musicId){
    let songData = await request('/song/detail', {ids: musicId})

    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      durationTime
    })

    //动态修改窗口标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  //处理音乐播放
  handleMusicPlay(){
    let isPlay = !this.data.isPlay
    let {musicId} = this.data
    this.musicControl(isPlay, musicId)
  },

  //控制音乐播放
  async musicControl(isPlay, musicId){
    if(isPlay){
      //获取播放链接
      let musicLinkData =  await request('/song/url', {id: musicId})
      let musicLink = musicLinkData.data[0].url
      console.log(musicId);
      console.log(musicLink);
      //创建背景音频实例
      this.backgroundAudioManger.title = this.data.song.name
      if(this.backgroundAudioManger.src === musicLink){
        this.backgroundAudioManger.play()
      }else{
        this.backgroundAudioManger.src = musicLink
      }
    }else{
      this.backgroundAudioManger.pause()
    }
  },

  //点击切歌回调
  hanldeSwitch(event){
    let type = event.currentTarget.id
    //关闭当前音乐
    this.backgroundAudioManger.stop()
    //订阅来自RecommendSong页面发布的musicId消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      console.log(musicId);
      //获取歌曲详情信息
      this.getMusicInfo(musicId)
      //自动播放下一首音乐
      this.musicControl(true, musicId)
      //取消订阅
      PubSub.unsubscribe('musicId')
      this.setData({
        musicId
      })
    })
    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
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