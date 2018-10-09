const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    authTitle: app.globalData.authTitle,
    authSubTitle: app.globalData.authSubTitle,
    phoneSubTitle: app.globalData.phoneSubTitle,
    isAuth: !0,
    isPhone: !0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showShade: false,
    imgUrl: app.globalData.imgService,
    isShow: true,
    toggleExtractCode: !0,
    notice: '您的剩余酒数量为0瓶，请先充值！',
  },

  onLoad: function(options) {
    let that = this,
      _sceneInfo = app.globalData.sceneInfo;
    let obj = util.strToObj(app.globalData.sceneInfo.query.scene);
    that.setData({
      uId: wx.getStorageSync('userInfo').id,
      uName: wx.getStorageSync('userInfo').nickname,
      storeId: options.shopid || _sceneInfo.query.shopid || obj.shopid,
      refereeId: _sceneInfo.query.refereeid || '0',
    })

  },

  onShow: function() {
    let that = this
    app.checkLogin(that, function() {
      that.getUserInfo()
      that.isVipUser()
      that.getActivityList()
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
        that.getUserInfo()
        that.isVipUser()
        that.getActivityList()
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
    app.checkLogin(that, function() {
      that.getUserInfo()
      that.isVipUser()
      that.getActivityList()
    })
    wx.stopPullDownRefresh();
  },

  //关闭分享
  closeShare: function() {
    this.setData({
      isShow: !0
    });
  },

  // 会员详情跳转
  userDetailTap: function() {
    wx.navigateTo({
      url: '../vip-detail/vip-detail?storeid=' + this.data.storeId + '&storename=' + this.data.storeName,
    })
  },

  // 隐藏核销码
  codeClose: function() {
    this.setData({
      showShade: false
    })
  },

  //会员卡充值
  shopCharge: function(event) {
    wx.navigateTo({
      url: '../vip-card/vip-card?shopid=' + this.data.storeId,
    })
  },

  // 转赠中心
  donationTap: function() {
    wx.navigateTo({
      url: '../give-center/give-center',
    })
  },

  // 返回主页按钮
  goHomeTap: function() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  //选择门店后进入相应门店
  goToChargeActivityCard: function(event) {
    let shopId = event.currentTarget.dataset.storeid
    wx.navigateTo({
      url: '../vip-card/vip-card?shopid=' + shopId,
    })
  },

  //88卡充值跳转详情
  goToChargeUserCard: function(e) {
    var id = e.currentTarget.dataset.cardid,
      shopid = e.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../activity/activity?shopid=' + shopid + '&id=' + id
    })
  },

  //扫码点单
  scanQrCode: function() {
    util.showToastError('该功能暂未开放！');
  },

  // 显示核销码
  codeShow: function() {
    if (this.data.cardInfo.wine_number <= 0 && this.data.cardInfo.beer <= 0 && this.data.cardInfo.red_wine_card <= 0 && this.data.cardInfo.red_wine_account <= 0) {
      wx.showModal({
        title: '提示',
        content: this.data.notice,
        showCancel: false,
        success: function(res) {
          if (res.confirm) {}
        }
      });
    } else {
      this.getUserInfo('toggle');
      this.setData({
        showShade: true
      })
    }
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
              nickname: _userInfo.nickname,
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

  //获取用户是否该门店的VIP会员
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
          let _store_info = res.result.data.storeinfo
          that.setData({
            storeName: _store_info.storesname,
            activeList: _active_list,
            memberList: _member_list
          });

          //设置文档标题
          wx.setNavigationBarTitle({
            title: "联盟商家-" + _store_info.storesname,
          })

        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //点击获取门店分享小程序码
  getShareQrImg: function() {
    var that = this
    that.setData({
      isShow: !1
    });
    util.sendRequest({
      url: 'shop_card/creatstoreImage',
      data: {
        page: "pages/shop/shop",
        scene: 'shopid=' + that.data.storeId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            shareQrcodeImg: res.result.data.imgurl
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

  //设置页面分享数据
  onShareAppMessage: function() {
    return {
      title: this.data.uName + '邀您一起来' + this.data.storeName + ' happy！',
      path: '/pages/shop/shop?shopid=' + this.data.storeId + '&refereeid=' + this.data.uId,
      success: function(res) {
        util.showToastSuccess("分享成功");
        // 转发成功
      },
      fail: function(res) {
        console.log('分享取消', res)
        // 转发失败
      }
    }
  },
})