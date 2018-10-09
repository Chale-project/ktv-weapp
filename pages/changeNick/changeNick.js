const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      nickName: options.nick
    })
  },
  getValue: function(e) {
    let value = e.detail.value
    this.data.nickName = value
  },
  //确认
  confirmChange: function() {
    let name = this.data.nickName
    util.sendRequest({
      url: 'users/updateUserInfo',
      data: {
        username: name
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          const userInfo = wx.getStorageSync('userInfo')
          userInfo.nickname = name
          wx.setStorageSync('userInfo', userInfo)
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  }

})