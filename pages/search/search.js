const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    key: '',
    imgUrl: app.globalData.imgService,

  },

  searchKey: function(e) {
    let key = e.detail.value
    this.setData({
      key: key
    })
  },

  // 商家跳转
  funnyStoreTap: function(event) {
    let storeId = event.currentTarget.dataset.storeid
    let storesname = event.currentTarget.dataset.storesname
    wx.navigateTo({
      url: "../shop/shop?shopid=" + storeId + "&shopname=" + storesname
    });
  },

  // 点击搜索
  searchTap: util.throttle(function() {
    let key = this.data.key
    if (key) {
      this.searchStoresList(key)
    } else {
      util.showToastFunction("请输入你想要了解的门店~")
    }
  }, 1000),

  // 搜索门店列表
  searchStoresList: function(key) {
    let that = this
    util.sendRequest({
      url: 'stores/stores_list',
      data: {
        key: key
      },
      success: function(res) {
        that.setStoresList(res)
      }
    })
  },

  // 设置商品列表
  setStoresList: function(res) {
    if (res.code == '00000') {
      util.setToken(res)
      let list = res.result.data.list
      if (list.length > 0) {
        this.setData({
          storeList: res.result.data.list
        })
      } else {
        util.showToastError("未找到相关门店");
        this.setData({
          storeList: []
        })
      }

    } else {
      util.showToastError(res.message);
    }
  },
})