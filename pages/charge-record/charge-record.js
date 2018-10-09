const app = getApp()
const util = require("../../utils/util.js")

Page({
  data: {
    page: 1,
    limits: 20,
    chargeList: [],
    hidden: !0

  },
  onLoad: function(options) {
    this.setData({
      storeId: options.shopid
    })
  },

  onShow: function() {
    this.getChargeList()
  },


  //上拉加载
  onReachBottom: function() {
    var that = this;
    that.setData({
      page: that.data.page + 1
    })
    if (that.data.page <= that.data.allpage) {
      wx.showNavigationBarLoading();
      that.getChargeList()
    } else {
      that.setData({
        hidden: !1,
      });
    }
  },

  //获取充值记录
  getChargeList: function() {
    let that = this
    util.sendRequest({
      url: 'shop_card/getAllRecharge',
      data: {
        page: that.data.page,
        limits: that.data.limits,
        store_id: that.data.storeId
      },
      success: function(res) {
        that.setChargeList(res)
      }
    })
  },

  //设置充值记录
  setChargeList: function(res) {
    let that = this
    if (res.code == '00000') {
      util.setToken(res)
      let list = res.result.data.rechargeList,
        _chargeList = that.data.chargeList;

      that.setData({
        allpage: res.result.data.allpage,
        hidden: (res.result.data.nowpage == res.result.data.allpage ? !1 : !0),
      });

      if (list.length > 0) {
        that.setData({
          chargeList: _chargeList.concat(list),
        });
      } else {
        that.setData({
          hidden: !1,
        });
      }
      wx.hideNavigationBarLoading();
    } else {
      util.showToastError(res.message);
    }
  },



});