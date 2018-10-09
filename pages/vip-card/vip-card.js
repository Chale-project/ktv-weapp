//vip-card.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    imgUrl: app.globalData.imgService,
    referId: '0'
  },

  onLoad: function(options) {
    this.setData({
      storeId: options.shopid
    })
  },

  onShow: function() {
    this.getActivityList();
  },



  //充值记录
  goToCardDetail: function() {
    wx.navigateTo({
      url: '../charge-record/charge-record?shopid=' + this.data.storeId,
    })
  },



  //获取用户是否该门店的活动卡
  getActivityList: function() {
    let that = this;
    util.sendRequest({
      url: 'shop_card/storeInfo',
      data: {
        store_id: that.data.storeId
      },
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          let _active_list = res.result.data.active_list
          let _member_list = res.result.data.member_list
          that.setData({
            activeList: _active_list,
            memberList: _member_list
          });
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },




  //活动一键充值
  oneKeyCharge: function(e) {
    let that = this,
      _url = '',
      data = {},
      _type = e.currentTarget.dataset.type,
      _id = e.currentTarget.dataset.id,
      _money = e.currentTarget.dataset.money,
      _title = e.currentTarget.dataset.name;

    if (_type == 'card') {
      _url = 'shop_card/memberRecharge',
        data = {
          cardtype: _id,
          money: _money,
          referid: that.data.referId,
          storeid: that.data.storeId
        }
    } else if (_type == 'activity') {
      _url = 'card/beferCardRecharge'
      data = {
        active_id: _id,
        amount: _money,
        pay_type: 2,
        store_id: that.data.storeId
      }
    }
    util.sendRequest({
      url: _url,
      data: data,
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let _ordersn = null,
            _body = '您将购买' + _money + '的' + _title;

          if (res.result.data.recharge) {
            _ordersn = res.result.data.recharge.order_sn
          } else if (res.result.data.payInfo) {
            _ordersn = res.result.data.payInfo.order_sn
          }
          app.wxInterface(that, _body, _money, _ordersn)
        } else {
          util.showToastError(res.message)
        }
      }
    })

  },


  //显示卡详情
  goToVipCardDetail: function(e) {
    let _type= e.currentTarget.dataset.type,
      _id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../vip-card-detail/vip-card-detail?type=' + _type + '&cardid=' + _id,
    });
  },

})