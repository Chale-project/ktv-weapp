// pages/rewardSucess/rewardSucess.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      money:options.money,
      storesname: options.storesname
    })
  },
  //返回个人中心
  returnHome:function(){
    wx.switchTab({
      url: '../user/user'
    })
  }

})