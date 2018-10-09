const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sharesubname: '  点击立即抢购>>',
    shareQrcodeImg: '',
    isShow: true,
    imgUrl: app.globalData.imgService,
    shareImgUrl: app.globalData.shareImgUrl,
    authTitle: app.globalData.authTitle,
    authSubTitle: app.globalData.authSubTitle,
    phoneSubTitle: app.globalData.phoneSubTitle,
    isAuth: !0,
    isPhone: !0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var _sceneInfo = app.globalData.sceneInfo
    let obj = util.strToObj(app.globalData.sceneInfo.query.scene);
    this.setData({
      uId: wx.getStorageSync('userInfo').id,
      uName: wx.getStorageSync('userInfo').nickname,
      cardId: options.id || _sceneInfo.query.id || obj.id,
      shopId: options.shopid || _sceneInfo.query.shopid || obj.shopid,
      refereeId: options.refereeid || _sceneInfo.query.refereeid || obj.refereeid || '0',
    })

  },

  onShow: function() {
    let that = this
    app.checkLogin(that, function() {
      that.getActDetail()
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
        that.getActDetail()
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

  //获取活动详情
  getActDetail: function() {
    let that = this
    util.sendRequest({
      url: 'shop_card/memberCardInfo',
      data: {
        card_id: that.data.cardId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            actInfo: res.result.data.cardlist
          })
        }
      }
    })
  },


  //立即成为会员
  chargeCardUser: function() {
    let that = this,
      _cardid = that.data.cardId,
      _money = that.data.actInfo.buy_money,
      _title = that.data.actInfo.name,
      _refereeid = that.data.refereeId,
      _shopid = that.data.shopId;
    util.sendRequest({
      url: 'shop_card/memberRecharge',
      data: {
        cardtype: _cardid,
        money: _money,
        referid: _refereeid,
        storeid: _shopid
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let _ordersn = res.result.data.payInfo.order_sn,
            _body = '您将购买' + _money + '的' + _title;
          app.wxInterface(that, _body, _money, _ordersn)
        } else {
          util.showToastError(res.message)
        }
      }
    })
  },


  //关闭分享
  closeShare: function() {
    this.setData({
      isShow: !0
    });
  },

  //点击获取分享图片
  getShareImg: function() {
    var that = this
    that.setData({
      isShow: !1
    });
    util.sendRequest({
      url: 'shop_card/creat_spreatmsg',
      data: {
        page: "pages/activity/activity",
        scene: 'id=' + that.data.cardId + '&shopid=' + that.data.shopId + '&refereeid=' + that.data.uId,
        card_type: that.data.cardId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            shareQrcodeImg: that.data.shareImgUrl + res.result.data.imgurl
          })
        }
      }
    })
  },


  // 保存图片
  saveTap: function() {
    let imgurl = this.data.shareQrcodeImg
    wx.downloadFile({
      url: imgurl,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            util.showToastSuccess("保存成功");
          },
          fail: function(res) {
            util.showToastError("保存失败");
          }
        })
      },
      fail: function() {

      }
    })
  },

  // 预览图片
  previewImage: function(e) {
    let imgurl = this.data.shareQrcodeImg
    wx.previewImage({
      urls: imgurl.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })
  },

  //打电话
  callPhone: function(e) {
    var _phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: _phone
    })
  },

  //导航
  openLoc: function(e) {
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



  //设置页面分享数据
  onShareAppMessage: function() {
    return {
      title: this.data.uName + '分享给您' + this.data.actInfo.storesname + this.data.actInfo.buy_money + this.data.actInfo.name + this.data.sharesubname,
      path: '/pages/activity/activity?id=' + this.data.cardId + '&shopid=' + this.data.shopId + '&refereeid=' + this.data.uId,
      imageUrl: this.data.actInfo.back_img,
      success: function(res) {
        util.showToastSuccess('分享成功！')
        console.log('分享成功', res)
      },
      fail: function(res) {
        console.log('分享取消', res)
        // 转发失败
      }
    }
  },

})