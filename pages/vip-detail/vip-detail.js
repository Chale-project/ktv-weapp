const app = getApp();
const util = require("../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _userInfo = wx.getStorageSync('userInfo'),
      _storeid = options.storeid,
      _storename = options.storename;
    this.setData({
      userInfo: _userInfo,
      storeId: _storeid,
      storeName: _storename
    })
    this.isVipUser();
  },

  //获取用户是否该门店的会员
  isVipUser: function() {
    let that = this;
    util.sendRequest({
      url: 'shop_card/is_memeber',
      data: {
        store_id: that.data.storeId
      },
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          let _isVip = res.result.data.isMember;
          that.setData({
            isVip: (_isVip == 1 ? !0 : !1),
          });
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //立即成为会员
  goToVipCard: function() {
    wx.navigateTo({
      url: '../vip-card/vip-card?shopid=' + this.data.storeId,
    })
  }

})