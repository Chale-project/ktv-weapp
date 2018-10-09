//vip-card.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    imgUrl: app.globalData.imgService,
  },

  onLoad: function(options) {
    this.getCardInfo();
  },


  //用卡记录
  goToCardRecord: function() {
    wx.navigateTo({
      url: '../card-record/card-record',
    })
  },

  //领赠记录
  goToCardDetail: function() {
    wx.navigateTo({
      url: '../red-packets-record/red-packets-record',
    })
  },

  getCardInfo: function() {
    let that = this;
    util.sendRequest({
      url: 'card/getUserCardInfo',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res);
          let cardList = res.result.data.TcardList
          if (Object.keys(cardList).length > 0) {
            that.showCardInfo(cardList)
          }
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //显示卡信息
  showCardInfo: function(obj) {
    let that = this,
      stListArr = obj.st;
    if (stListArr.length > 0) {
      that.setData({
        stList: stListArr,
      });
    }
  },

  //一键转赠
  giveAs: function(e) {
    let _type = e.currentTarget.dataset.type,
      _title = e.currentTarget.dataset.title,
      _amount = e.currentTarget.dataset.amount;

    if (_amount > 0) {
      wx.navigateTo({
        url: '../donation/donation?title=' + _title + '&type=' + _type,
      });
    } else {
      util.showToastError('没有相关可转赠的酒哦^_^')
    }


  },

  //显示卡详情
  goToVipCardDetail: function(e) {
    let cardInfo = {
      type: e.currentTarget.dataset.type,
      title: e.currentTarget.dataset.title,
      icon: e.currentTarget.dataset.icon,
      time: e.currentTarget.dataset.time,
      par_value: e.currentTarget.dataset.parvalue,
      amount: e.currentTarget.dataset.amount
    }
    wx.navigateTo({
      url: '../vip-card-detail/vip-card-detail?cardinfo=' + JSON.stringify(cardInfo),
    });
  },

})