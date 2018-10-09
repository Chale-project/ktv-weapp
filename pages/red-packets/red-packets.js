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
    animationData: {},
    showRecordModal: true,
    open: true,
    mobile: null,
    redPacketsInfo: {
      redPacketsStatus: 1
    },
    redPacketsId: null,
    redType: null,
    hint: "请允许获取个人信息~",
  },

  onLoad: function(options) {
    var _sceneInfo = app.globalData.sceneInfo
    let obj = util.strToObj(app.globalData.sceneInfo.query.scene);
    this.setData({
      type: _sceneInfo.query.type || obj.type,
      redPacketsId: _sceneInfo.query.id || obj.id,
    });

  },

  onShow: function() {
    let that = this
    app.checkLogin(that, function() {
      that.getRedPacketsInfo()
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
        that.getRedPacketsInfo()
      })
    } else {
      return;
    }
  },



  //获取红包信息
  getRedPacketsInfo: function() {
    let that = this;
    util.sendRequest({
      url: 'card/checkSendInfo',
      data: {
        order_sn: that.data.redPacketsId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let sendInfo = res.result.data.sendInfo;
          that.setData({
            get_number: parseInt(sendInfo.get_number),
            hints: (sendInfo.status == 1 ? "您已成功领取过啦！" : ""),
            redPacketsInfo: {
              num: sendInfo.number,
              title: sendInfo.title,
              type: (sendInfo.type ? sendInfo.type : ''),
              avatar: sendInfo.headimgurl,
              mobile: sendInfo.mobile,
              nickname: sendInfo.nickname,
              redPacketsStatus: sendInfo.status
            },
          })
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },




  //开红包接口
  openRedPackets: function() {
    let that = this;
    util.sendRequest({
      url: 'card/userCardRecive',
      data: {
        order_sn: that.data.redPacketsId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let insertInfo = res.result.data.insertInfo;
          that.setData({
            get_number: insertInfo.get_number,
            hints: '恭喜您！',
            redPacketsInfo: {
              type: insertInfo.type,
              title: insertInfo.title,
              avatar: insertInfo.headimgurl,
              nickname: insertInfo.nickname,
              mobile: insertInfo.mobile,
              redPacketsStatus: 1
            }
          });

        } else if (res.code == 10001) {
          util.setToken(res)
          let insertInfo = res.result.data.insertInfo;
          that.setData({
            get_number: insertInfo.get_number,
            hints: '您已经领过啦^_^！',
            redPacketsInfo: {
              type: insertInfo.type,
              title: insertInfo.title,
              avatar: insertInfo.headimgurl,
              nickname: insertInfo.nickname,
              mobile: insertInfo.mobile,
              redPacketsStatus: 1
            }
          });

        } else if (res.code == 10002) {
          let insertInfo = res.result.data.insertInfo;
          that.setData({
            hints: '来晚了红包已领光^_^！',
            redPacketsInfo: {
              avatar: insertInfo.headimgurl,
              nickname: insertInfo.nickname,
              mobile: insertInfo.mobile,
              redPacketsStatus: 2
            }
          });

        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //返回首页
  robbedGiveas: function() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  //显示领取规则
  showDetailToggle: function() {
    let toggle = this.data.open;
    this.setData({
      open: !toggle
    });
  },


  //领取记录
  robbedRecord: function() {
    let that = this;
    that.showRedRecord();
    util.sendRequest({
      url: 'card/getCardLogInfo',
      data: {
        order_sn: that.data.redPacketsId
      },
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let recivelist = res.result.data.recivelist
          that.setData({
            recordList: recivelist
          })
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },



  animationAction: function(y) {
    var animation = wx.createAnimation({
      timingFunction: 'ease'
    })
    this.animation = animation
    animation.translateY(y).step()
    this.setData({
      animationData: animation.export()
    })
  },


  //显示领取记录
  showRedRecord: function() {
    this.setData({
      showRecordModal: false
    })
    this.animationAction(-500)
  },

  //隐藏领取记录
  hideRedRecord: function() {
    this.setData({
      showRecordModal: true
    })
    this.animationAction(0)
  },

})