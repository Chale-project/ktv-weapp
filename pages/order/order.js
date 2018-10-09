const app = getApp()
const util = require("../../utils/util.js")
const sliderWidth = 85
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["全部", "待付款", "已支付", "已完成"],
    hidden: true,
    type: 0,
    page: 1,
    limits: 10,
    sliderOffset: 0,
    sliderLeft: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this,
      _type = options.type;
    that.setData({
      type: _type
    })
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.type
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      hidden: true,
      page: 1,
      orderList: []
    });
    this.getOrderList(this.data.type, this.data.page);
  },

  //切换订单状态
  switchTab: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      type: e.currentTarget.id,
      page: 1,
      hidden: true,
      orderList: []
    });
    this.getOrderList(e.currentTarget.id, this.data.page);
  },

  getOrderList: function(type, p) {
    let that = this;
    util.sendRequest({
      url: 'order/getUserOrder',
      data: {
        type: type,
        page: p,
        limits: that.data.limits
      },
      success: function(res) {
        wx.hideNavigationBarLoading();
        if (res.code === '00000') {
          util.setToken(res)
          let data = res.result.data;
          let orderList = that.data.orderList;
          that.setData({
            allpage: data.allpage,
          });
          if (data.orderList.length > 0) {
            that.setData({
              orderList: orderList.concat(data.orderList),
            });
          } else {
            that.setData({
              hidden: false,
            });
          }
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //上啦加载
  lower: function() {
    var that = this;
    that.setData({
      page: that.data.page + 1
    })
    if (that.data.page <= that.data.allpage) {
      wx.showNavigationBarLoading();
      that.getOrderList(that.data.type, that.data.page)
    } else {
      that.setData({
        hidden: false,
      });
    }
  },

  //查看订单详情
  goToOrderDetail: function(e) {
    wx.navigateTo({
      url: '../order-detail/order-detail',
    })
  },

  //立即支付
  payNow: function() {

  },

  //确认完成
  sureDone: function() {

  },

})