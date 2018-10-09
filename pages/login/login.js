const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    butVerifyCode: '获取验证码',
    countDownVal: '59',
    disabled: false,
    mobile: null,
    code: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  onShow: function() {

  },

  //发送验证码
  getVerifyCode: function() {
    let that = this,
      flag = !0,
      _mobile = that.data.mobile;
    let reg = /^(1)[0-9]{10}$/;
    if (!reg.test(_mobile)) {
      util.showToastError("请输入有效的手机号码！");
      flag = !1;
      return false;
    };
    let data = {
      mobile: _mobile
    };
    flag && util.sendRequest({
      url: 'reg/creatcode',
      data: data,
      success: function(res) {
        let data = res.result.data;
        if (res.code === '00000') {
          that.setData({
            disabled: true
          });
          that.showTimeout();
          util.showToastSuccess('发送成功！')
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },


  //倒计时
  showTimeout: function() {
    let that = this;
    let currentTime = that.data.countDownVal;
    let timer = setInterval(function() {
      that.setData({
        butVerifyCode: currentTime + '秒'
      });
      currentTime--;
      if (currentTime <= 0) {
        clearInterval(timer);
        that.setData({
          disabled: false,
          butVerifyCode: '获取验证码',
          currentTime: 59
        })
      }
    }, 1e3)
  },


  //获取手机号
  inputMobile: function(e) {
    this.setData({
      mobile: e.detail.value
    });
  },

  //获取验证码
  inputCode: function(e) {
    this.setData({
      code: e.detail.value
    });
  },

  //检验手机号验证码输入
  checkMobileCode: function() {
    let reg = /^(1)[0-9]{10}$/,
      mobile = this.data.mobile,
      code = this.data.code;
    if (!reg.test(mobile)) {
      util.showToastError("请输入有效的手机号码！");
      return false;
    } else if (!/^\d{6}$/.test(code)) {
      util.showToastError("请输入6位有效验证码！");
      return false;
    } else {
      return true;
    }
  },

  //绑定用户
  bindUser: function() {
    let that = this;
    let flag = that.checkMobileCode();
    flag && that.regUser();
  },

  //注册登录
  regUser: function() {
    let that = this
    util.sendRequest({
      url: 'reg/reguser',
      data: {
        mobile: that.data.mobile,
        openid: app.globalData.openId,
        nickname: app.globalData.unUserInfo.nickName || wx.getStorageSync('unUserInfo').nickName,
        headimgurl: app.globalData.unUserInfo.avatarUrl || wx.getStorageSync('unUserInfo').avatarUrl,
        sex: app.globalData.unUserInfo.gender || wx.getStorageSync('unUserInfo').gender,
        code: that.data.code,
        type: 1,
        refer: 2
      },
      success: function(res) {
        let data = res.result.data;
        if (res.code === '00000') {
          util.setToken(res)
          app.storageUserInfo(data);
          wx.navigateBack({
            delta: 1
          })
        } else {
          console.log('报错了>>', res.code, res.message)
          util.showToastError(res.message)
        }
      }
    });
  },

})