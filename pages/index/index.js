//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    longitude: null,
    latitude: null,
    imgUrl: app.globalData.imgService,
    authTitle: app.globalData.authTitle,
    authSubTitle: app.globalData.authSubTitle,
    phoneSubTitle: app.globalData.phoneSubTitle,
    isAuth: !0,
    isPhone: !0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    indicatorColor: '#ddd',
    indicatorActiveColor: '#ff9800',
    NearbyShop: [],
    toggleExtractCode: !0,
    notice: '您的剩余酒数量为0瓶，请先充值！',
    isHide: !0,
    menuIndex: 0,
  },

  onLoad: function(options) {

  },

  onShow: function() {
    var that = this;
    app.checkLogin(that, function () {
      that.getLocation();
      that.getUserInfoCode();
      that.getBanner();
      that.getNavList();
    })
  },

  //授微信权
  bindGetUserInfo: function(e) {
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
  bindGetphonenumber: function(e) {
    var that = this
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      app.decryptPhone(that, e.detail.encryptedData, e.detail.iv, function() {
        that.getLocation();
        that.getUserInfoCode();
        that.getBanner();
        that.getNavList();
      })
    } else {
      return;
    }
  },

  //跳转到注册登录页
  goToRegLogin: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  //下拉刷新
  onPullDownRefresh: function() {
    var that = this;
    app.checkLogin(that, function() {
      that.getLocation();
      that.getUserInfoCode();
      that.getBanner();
      that.getNavList();
    })
    wx.stopPullDownRefresh();
  },


  //栏目导航
  moduleTap: function(e) {
    var _type = e.currentTarget.dataset.moduletype,
      _url = e.currentTarget.dataset.moduleurl;
    if (_type == 0) {
      util.showToastError('该功能暂未开放！');
      return;
    } else if (_type == 1) {
      wx.navigateTo({
        url: _url
      })
    } else if (_type == 2) {
      this.setData({
        menuIndex: 2,
        isHide: !1
      })
    }

  },

  // 门店跳转
  linkTap: function(event) {
    let shopId = event.currentTarget.dataset.shopid,
      shopName = event.currentTarget.dataset.shopname;
    wx.navigateTo({
      url: "../shop/shop?shopid=" + shopId + '&shopname=' + shopName,
    })

  },


  //选择门店后进入相应门店
  reserveTap: function(event) {
    let shopId = event.currentTarget.dataset.shopid
    if (this.data.menuIndex == 2) { //线上充值
      this.setData({
        isHide: !0
      })
    }
    wx.navigateTo({
      url: '../vip-card/vip-card?shopid=' + shopId,
    })
  },

  //88卡充值跳转详情
  memberCardTap: function(e) {
    var id = e.currentTarget.dataset.cardid,
      shopid = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: '../activity/activity?shopid=' + shopid + '&id=' + id
    })
  },

  //连接到搜索页
  searchFocus: function() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  //关闭门店选择
  closeBuy: function() {
    this.setData({
      isHide: true
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
      this.getUserInfoCode('toggle');
  },

  //导航
  openNavigation: function(e) {
    var _name = e.currentTarget.dataset.name,
      _latitude = +e.currentTarget.dataset.latitude,
      _longitude = +e.currentTarget.dataset.longitude;
    wx.openLocation({
      name: _name,
      latitude: _latitude,
      longitude: _longitude,
      scale: 28
    })
  },

  //获取地址经纬度
  getLocation: function() {
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        that.getNearbyShop()
      },
      fail: function() {}
    })
  },


  // 获取banner
  getBanner: function() {
    var that = this
    util.sendRequest({
      url: 'index/banner_list',
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let activityList = res.result.data.list
          that.setData({
            activityList: activityList
          })
        }
      }
    })
  },

  // 获取首页导航
  getNavList: function() {
    let that = this;
    util.sendRequest({
      url: 'index/navigation_list',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          let menuList = res.result.data.list
          that.setData({
            menuList: menuList,
          })
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  // 获取核销码
  getUserInfoCode: function(toggle) {
    let that = this;
    util.sendRequest({
      url: 'card/getUserCardInfo',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          let _userInfo = res.result.data.userInfo,
            _cardInfo = res.result.data.cardInfo;
          that.setData({
            usercode: _userInfo.extract_code,
            toggleExtractCode: (toggle ? !that.data.toggleExtractCode : !0),
            cardInfo: _cardInfo
          });
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },


  // 获取附近商家
  getNearbyShop: function() {
    var that = this
    util.sendRequest({
      url: 'index/stores_list',
      data: {
        longitude: that.data.longitude,
        latitude: that.data.latitude
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            NearbyShop: res.result.data.list
          })
        }
      }
    })
  },




})