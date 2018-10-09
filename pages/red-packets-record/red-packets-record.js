//red-packets-record.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    noData: !0,
    loading: !1
  },

  onLoad: function() {
    this.showCurDate();
    this.getbounsList()
  },

  showCurDate: function() {
    let date = new Date,
      year = date.getFullYear(),
      month = date.getMonth() + 1
    this.setData({
      curDate: year + '-' + util.checktime(month)
    })
  },

  //获取领赠记录
  getbounsList: function() {
    let that = this;
    util.sendRequest({
      url: 'card/bounsList',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res)
          that.setData({
            loading: !0
          })
          let recivelist = res.result.data.recivelist;
          if (recivelist.length > 0)
            that.setData({
              getReciveList: recivelist
            })
          else
            that.setData({
              noData: false
            })

        } else {
          util.showToastError(res.message)
        }
      }
    });
  },
})