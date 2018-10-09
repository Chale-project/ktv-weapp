//vip-card.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    imgUrl: app.globalData.imgService,
  },

  onLoad: function(options) {
    this.setData({
      cardInfo: JSON.parse(options.cardinfo) 
    });
  },

})