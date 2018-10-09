//app.js
const util = require('utils/util.js')

App({
  onLaunch: function() {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function() {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function(res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },

  onShow: function(options) {
    this.globalData.sceneInfo = options;
    console.log(options)
  },


  //检查用户
  checkLogin: function(s, c) {
    let that = this
    that.getCode(s, c)
    // if (!that.getSessionKey()) {
    //   that.getCode(s, c)
    // } else {
    //   s.setData({
    //     isAuth: !0,
    //     isPhone: !0
    //   })
    //   typeof c == 'function' && c();
    // }
  },


  //获取会员token
  getSessionKey: function() {
    return wx.getStorageSync('token');
  },

  //登录发送code
  getCode: function(s, c) {
    let that = this
    wx.login({
      success: function(res) {
        let code = res.code;
        that.checkUser(s, code, c)
      },
      fail: function() {
        util.showToastError('code获取失败')
        console.log('code获取失败');
      }
    });
  },

  //校验用户注册信息
  checkUser: function(s, code, c) {
    let that = this
    util.sendRequest({
      url: 'reg/logininfo',
      data: {
        js_code: code,
        refer: 2
      },
      success: function(res) {
        let _data = res.result.data;
        that.globalData.openId = _data.weMessage.openid;
        that.globalData.sessionKey = _data.weMessage.session_key;
        s.setData({
          checkStatus: res.result.checkstatus
        })
        if (res.code == 40044) {
          that.globalData.isUser = !1;
          wx.getSetting({
            success: function(res) {
              if (res.authSetting['scope.userInfo']) { // 已经授权，可以直接显示绑定手机号
                wx.getUserInfo({ //再次获取用户信息
                  success: function(res) {
                    that.globalData.unUserInfo = res.userInfo
                    wx.setStorageSync('unUserInfo', res.userInfo)
                    s.setData({
                      isAuth: !0,
                      isPhone: !1
                    })
                  }
                })
              } else {
                s.setData({
                  isAuth: !1,
                  isPhone: !0
                })
              }
            }
          })
        } else if (res.code === '00000') {
          s.setData({
            isAuth: !0,
            isPhone: !0
          })
          wx.setStorageSync("token", res.result.token);
          that.storageUserInfo(_data);
          typeof c == 'function' && c()
        } else {
          util.showToastError(res.message)
          console.log('报错了>>', res.code, res.message)
        }
      }
    });
  },

  //通过wx.bindGetphonenumber信息解密用户手机号
  decryptPhone: function(s, encryptedData, iv, c) {
    let that = this
    util.sendRequest({
      url: 'reg/checkcode',
      data: {
        sessionKey: that.globalData.sessionKey,
        encryptedData: encryptedData,
        iv: iv,
        refer: 2
      },
      success: function(res) {
        let data = res.result.data;
        if (res.code === '00000') {
          var _phone = data.mobile_info.purePhoneNumber
          that.regUser(s, _phone, c);
        } else {
          util.showToastError(res.message)
          console.log('报错了>>', res.code, res.message)
        }
      }
    });
  },


  //通过解密的手机号绑定用户
  regUser: function(s, phone, c) {
    let that = this
    util.sendRequest({
      url: 'reg/reguser',
      data: {
        mobile: phone,
        openid: that.globalData.openId,
        nickname: that.globalData.unUserInfo.nickName || wx.getStorageSync('unUserInfo').nickName,
        headimgurl: that.globalData.unUserInfo.avatarUrl || wx.getStorageSync('unUserInfo').avatarUrl,
        sex: that.globalData.unUserInfo.gender || wx.getStorageSync('unUserInfo').gender,
        refer: 2
      },
      success: function(res) {
        let data = res.result.data;
        if (res.code === '00000') {
          s.setData({
            isAuth: !0,
            isPhone: !0
          })
          wx.setStorageSync("token", res.result.token);
          that.storageUserInfo(data);
          typeof c == 'function' && c()
        } else {
          console.log('报错了>>', res.code, res.message)
          util.showToastError(res.message)
        }
      }
    });
  },

  //拒绝授权
  refusingAuthor: function(s) {
    let that = this;
    wx.showModal({
      title: '警告',
      content: s.data.markedWords,
      confirmText: "重新授权",
      cancelText: '残忍拒绝',
      success: function(res) {
        if (res.confirm) {
          wx.openSetting({
            success: function(res) {
              console.log(res)
            },
          })
        } else if (res.cancel) {
          that.showToastError(s.data.markedWords)
        }
      }
    });
  },

  //设置存储用户信息
  storageUserInfo: function(data) {
    let _userInfo = data.userInfo;
    this.globalData.isUser = !0;
    wx.removeStorageSync('unUserInfo');

    this.globalData.userInfo = _userInfo;
    wx.setStorageSync('userInfo', _userInfo);
  },


  //微信预支付
  wxInterface: function(t, b, m, o) {
    let that = this,
      openid = wx.getStorageSync('userInfo').small_openid;
    util.sendRequest({
      url: 'orderpay/WechatPayNew',
      data: {
        openId: openid,
        body: b,
        totalFee: m,
        outTradeNo: o,
        type: 2
      },
      success: function(res) {
        if (res.code === '00000') {
          that.wxPay(t, res.result.data.payinfo)
        } else {
          util.showToastError(res.message)
        }
      }
    })
  },

  //调起微信支付
  wxPay: function(t, res) {
    let that = this
    let dic = JSON.parse(res.preResult)
    wx.requestPayment({
      'timeStamp': dic.timeStamp,
      'nonceStr': dic.nonceStr,
      'package': dic.package,
      'signType': dic.signType,
      'paySign': dic.paySign,
      success: function(res) {
        util.showToastSuccess('支付成功！');
        setTimeout(function() {
          wx.switchTab({
            url: '../user/user',
          })
        }, 1e3)
      },
      fail: function(res) {
        util.showToastError('支付失败！');
        t.setData({
          disabled: false
        })
      }
    })
  },

  globalData: {
    imgService: "https://p.whhykj.cn",
    shareImgUrl: 'https://ktv.whfhnd.cn',
    //shareImgUrl: 'https://ktv.puqikeji.com',
    authTitle: "欢唱时代申请获得以下权限",
    authSubTitle: "获取您的公开信息（头像、昵称）",
    phoneSubTitle: "请选择以下方式成为我们会员！",
    sessionKey: '',
    openId: '',
    isUser: !0,
    unUserInfo: {} || wx.getStorageSync('unUserInfo'),
    userInfo: {} || wx.getStorageSync('userInfo')
  }
})