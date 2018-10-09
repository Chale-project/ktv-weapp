Page({
  data: {},
  onShow: function() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && Object.keys(userInfo).length > 0) {
      this.setData({
        userInfo: userInfo,
      })
    }
  },

  // 修改绑定手机号
  alterPhone: function() {
    wx.navigateTo({
      url: '../alter-phone/alter-phone'
    })
  },

  multifyNick: function() {
    const userInfo = wx.getStorageSync('userInfo')
    wx.navigateTo({
      url: '../changeNick/changeNick?nick=' + userInfo.nickname,

    })
  }

})