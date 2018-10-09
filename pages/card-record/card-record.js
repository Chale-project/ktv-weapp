const app = getApp()
const util = require("../../utils/util.js")
var sliderWidth = 84; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    page: 1,
    limits: 20,
    tabList: [],
    cardType: null,
    cardList: [],
    hidden: !0,
    showDelete: !1,
    sliderOffset: 0,
    sliderLeft: 0,
  },
  onLoad: function(options) {

  },

  onShow: function() {
    this.getTabList()
  },

  switchTab: util.throttle(function(e) {
    let idx = e.currentTarget.dataset.index
    let _type = e.currentTarget.dataset.type
    let _tab = this.data.tabList
    for (let i in _tab) {
      (i == idx ? _tab[i].active = !0 : _tab[i].active = !1)
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      idx: idx,
      page: 1,
      cardType: _type,
      tabList: _tab,
      cardList: [],
      hidden: !0,

    })
    this.getCardList(this.data.cardType, this.data.page)
  }, 1000),

  //上拉加载
  onReachBottom: function(e) {
    var that = this;
    that.setData({
      page: that.data.page + 1
    })
    if (that.data.page <= that.data.allpage) {
      wx.showNavigationBarLoading();
      that.getCardList(that.data.cardType, that.data.page)
    } else {
      that.setData({
        hidden: false,
      });
    }
  },

  //获取tab
  getTabList: function() {
    let that = this;
    util.sendRequest({
      url: 'card/getUserCardInfo',
      success: function(res) {
        wx.hideNavigationBarLoading();
        if (res.code == '00000') {
          util.setToken(res);
          let cardList = res.result.data.TcardList
          if (Object.keys(cardList).length > 0) {
            that.showTabList(cardList)
          }
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //显示tab数据
  showTabList: function(obj) {
    let that = this,
      stListArr = obj.st;
    if (stListArr.length > 0) {
      for (let i in stListArr) {
        if (i == 0) {
          stListArr[i].active = !0
          let _type = stListArr[i].type
          that.setData({
            cardType: _type,
            idx: i
          })
          that.getCardList(that.data.cardType, that.data.page)
        } else {
          stListArr[i].active = !1
        }
      }
      wx.getSystemInfo({
        success: function(res) {
          that.setData({
            sliderLeft: (res.windowWidth / stListArr.length - sliderWidth) / 2,
            sliderOffset: res.windowWidth / stListArr.length * that.data.idx
          });
        }
      });
      that.setData({
        tabList: stListArr
      });

    }
  },

  //获取用卡记录
  getCardList: function(_type, p) {
    let that = this,
      data = {
        type: _type,
        page: p,
        limits: this.data.limits
      }
    util.sendRequest({
      url: 'card/getCardFlow',
      data: data,
      success: function(res) {
        that.setCardList(res)
      }
    })
  },

  //设置酒卡记录
  setCardList: function(res) {
    let that = this
    if (res.code == '00000') {
      util.setToken(res)
      let _data = res.result.data;
      let list = _data.flowList;
      let _cardList = that.data.cardList;

      that.setData({
        allpage: res.result.data.allpage,
        hidden: (res.result.data.nowpage == res.result.data.allpage ? !1 : !0),
      });

      if (list.length > 0) {
        that.setData({
          cardList: _cardList.concat(list)
        });
      } else {
        that.setData({
          hidden: !1,
        });
      }



      wx.hideNavigationBarLoading();
    } else {
      util.showToastError(res.message);
    }
  },
});