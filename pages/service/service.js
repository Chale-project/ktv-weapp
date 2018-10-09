const app = getApp()
const util = require("../../utils/util.js")
Page({
  data: {
    sType: 0
  },
  onLoad: function(even) {
    this.data.sType = even.type
  },

  // 点击提交
  bindFormSubmit: function(e) {
    let content = e.detail.value.textarea
    if (content) {
      this.getService(content)
    } else {
      util.showToastError('请输入您的建议')
    }
  },

  // 吐槽接口
  getService: function(content) {
    util.sendRequest({
      url: 'user_feedback/feedback',
      data: {
        content: content,
        platform: 1
      },
      success: function(res) {
        this.setService(res)
      }
    })
  },

  // 吐槽接口
  setService: function(res) {
    if (res.code == '00000') {
      util.setToken(res)
      util.showToastSuccess('感谢您的建议')
      setTimeout(function() {
        wx.navigateBack({
          delta: 1
        })
      }, 1000);
    }
  },

})