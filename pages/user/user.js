const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    authTitle: app.globalData.authTitle,
    authSubTitle: app.globalData.authSubTitle,
    phoneSubTitle: app.globalData.phoneSubTitle,
    isAuth: !0,
    isPhone: !0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    servicePhone: '13720256535',
    notice: '您的剩余酒数量为0瓶，请先充值！',
    toggleExtractCode: !0,
    orderData: [
      { type: 1, title: '待付款', url: '../order/order?type=', icon: '/images/order_unpay.png', num: 0 },
      { type: 2, title: '已支付', url: '../order/order?type=', icon: '/images/order_pay.png', num: 0 },
      { type: 3, title: '已完成', url: '../order/order?type=', icon: '/images/order_done.png', num: 0 },
    ],
    userInfo: {
      headimgurl: '/images/avatar.png',
      nickname: '欢唱时代',
      mobile: '',
      extract_code: ''
    },
  },

  onShow: function() {
    var that = this;
    app.checkLogin(that, function() {
      that.getUserInfo();
    })
  },


  //授微信权
  bindGetUserInfo: function (e) {
    var that = this
    if (e.detail.errMsg == "getUserInfo:ok") {
      this.setData({
        isAuth: !0,
        isPhone: !1
      })
      app.globalData.unUserInfo = e.detail.userInfo;
      wx.setStorageSync('unUserInfo', e.detail.userInfo)
      app.getCode(that)
    } else {
      return;
    }
  },

  //绑定手机号
  bindGetphonenumber: function (e) {
    var that = this
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      app.decryptPhone(that, e.detail.encryptedData, e.detail.iv, function () {
        that.getUserInfo();
      })
    } else {
      return;
    }
  },

  //跳转到注册登录页
  goToRegLogin: function () {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  //下拉刷新
  onPullDownRefresh: function() {
    var that = this;
    app.checkLogin(that, function () {
      that.getUserInfo();
    })
    wx.stopPullDownRefresh();
  },


  //获取用户信息
  getUserInfo: function(toggle) {
    let that = this;
    util.sendRequest({
      url: 'card/getUserCardInfo',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          let _userInfo = res.result.data.userInfo,
            _cardInfo = res.result.data.cardInfo;

          that.setData({
            userInfo: {
              headimgurl: _userInfo.headimgurl,
              nickname: _userInfo.username,
              mobile: util.mobileToStar(_userInfo.mobile),
              extract_code: _userInfo.extract_code
            },
            toggleExtractCode: (toggle ? !that.data.toggleExtractCode : !0),
            cardInfo: _cardInfo
          });
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //获取订单数量
  getUserOrderInfo: function() {
    let that = this;
    util.sendRequest({
      url: 'order/get_order_data',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          that.showUserOrderInfo(res);
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //显示订单对应个数
  showUserOrderInfo: function(res) {
    let that = this,
      data = res.result.data,
      orderDataArr = that.data.orderData,
      numArr = [];
    numArr = [data.type1, data.type2, data.type3, data.type4];
    for (let i in orderDataArr)
      for (let j in numArr)
        if (i == j) orderDataArr[i].num = numArr[j];
    that.setData({
      orderInfo: orderDataArr
    });
  },

  //个人资料
  goToUserInterests: function() {
    wx.navigateTo({
      url: '../person/person'
    })
  },

  //查看核销码
  toggleCode: function() {
    if (this.data.cardInfo.wine_number <= 0 && this.data.cardInfo.beer <= 0 && this.data.cardInfo.red_wine_card <= 0 && this.data.cardInfo.red_wine_account <= 0)
      wx.showModal({
        title: '提示',
        content: this.data.notice,
        showCancel: false,
        success: function(res) {
          if (res.confirm) {}
        }
      });
    else
      this.getUserInfo('toggle');
  },


  //分享奖励
  goToShare: function() {
    wx.navigateTo({
      url: '../rewards/rewards',
    })
  },

  //卡包
  goToCouponCenter: function() {
    wx.navigateTo({
      url: '../give-center/give-center',
    })
  },


  //用卡消费记录
  goToRecord: function () {
    wx.navigateTo({
      url: '../card-record/card-record',
    })
  },

  //精品会
  goToSort: function() {
    wx.switchTab({
      url: '../sort/sort',
    })
  },

  //服务中心
  service: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.servicePhone
    })
  },

  onHide: function() {

  },

  onUnload: function() {

  },
})