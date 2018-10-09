const app = getApp()
const util = require("../../utils/util.js")
let imgFlag = !1
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgService,
    shareImgUrl: app.globalData.shareImgUrl,
    authTitle: app.globalData.authTitle,
    authSubTitle: app.globalData.authSubTitle,
    phoneSubTitle: app.globalData.phoneSubTitle,
    isAuth: !0,
    isPhone: !0,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    animationData: {},
    showCartModal: true,
    moveActive: !1, //购物车图标动画激活
    inputShowed: false,
    inputVal: "",
    activeIndex: 0,
    page: 1,
    limits: 20,
    hidden: !0, //没有更多了
    totalNum: 0,
    totalMoney: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this,
      obj = util.strToObj(app.globalData.sceneInfo.query.scene);
    that.setData({
      shopId: obj.shopid || 3,
      roomId: obj.roomid || 104,
      cartList: wx.getStorageSync('cart') || [],
      goodsList: []
    })
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          deviceWidth: res.windowWidth,
          deviceHeight: res.windowHeight - 100
        });
      }
    });
  },

  onShow: function() {
    if (imgFlag) return; //阻止点击图片关闭后继续往下走

    let that = this
    that.initData();
    app.checkLogin(that, function() {
      that.getGoodsNav()
    })
  },

  //初始化数据
  initData: function() {
    this.setData({
      activeIndex: 0,
      page: 1,
      goodsType: '',
      goodsList: [],
      hidden: !0
    })
  },


  //设置文档标题
  setBarTitle: function(storeInfo, roomInfo) {
    wx.setNavigationBarTitle({
      title: `${storeInfo.storesname}-${roomInfo.name}-${roomInfo.roomname}`
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
        that.getGoodsNav()
      })
    } else {
      return;
    }
  },


  //跳转到注册登录页
  goToRegLogin: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },


  // 搜索input
  showInput: function() {
    this.initData();

    this.setData({
      inputShowed: true,
      goodsNav: [{
        id: '',
        name: '搜索结果'
      }],
    });
  },
  hideInput: function() {
    this.initData();

    this.setData({
      inputVal: "",
      inputShowed: false,
      goodsNav: []
    });
    this.getGoodsNav()
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function(e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  bindconfirm: function(e) {
    this.initData();
    this.setData({
      goodsNav: [{
        id: '',
        name: '搜索结果'
      }]
    });
    this.getSearchGoodsList()
  },


  //切换菜单
  changeTab: function(e) {
    //如果是搜索就禁用菜单切换
    if (this.data.inputShowed) return;

    let _index = e.currentTarget.dataset.index,
      _goodsType = e.currentTarget.dataset.id;
    this.setData({
      activeIndex: _index,
      goodsType: _goodsType,
      page: 1,
      goodsList: [],
      hidden: !0
    })
    this.getGoodsList(_goodsType)
  },

  //商品加
  goodsPlus: function(e) {
    let _id = e.currentTarget.dataset.id,
      _title = e.currentTarget.dataset.title,
      _price = e.currentTarget.dataset.price,
      obj = {
        id: _id,
        title: _title,
        price: _price,
        number: 1
      }
    this.addCart(obj);
  },

  //商品减
  goodsMinus: function(e) {
    let _id = e.currentTarget.dataset.id
    this.reduceCart(_id);
  },

  //添加购物车商品数量
  addCart: function(obj) {
    let that = this,
      goodsArr = that.data.goodsList,
      cartArr = wx.getStorageSync('cart') || [];
    that.setData({
      moveActive: !0
    })
    setTimeout(function() {
      that.setData({
        moveActive: !1
      })
    }, 200)
    if (cartArr.length > 0) {
      for (let i in cartArr) {
        if (cartArr[i].id == obj.id) {
          ++cartArr[i].number
          that.setCartList(cartArr)
          that.setGoodsList(goodsArr)
          return false;
        } else {
          if (i == (cartArr.length - 1)) {
            cartArr.push(obj);
            that.setCartList(cartArr)
            that.setGoodsList(goodsArr)
          }
        }
      }
    } else {
      cartArr.push(obj)
      that.setCartList(cartArr)
      that.setGoodsList(goodsArr)
    }
  },

  //减少购物车商品数量
  reduceCart: function(id) {
    let that = this,
      _cartList = wx.getStorageSync('cart'),
      _goodsList = that.data.goodsList;
    for (let i in _cartList) { //减购物车中的单个商品
      if (_cartList[i].id == id) {
        if (_cartList[i].number > 0) {
          --_cartList[i].number
          if (_cartList[i].number == 0) {
            _cartList.splice(i, 1);
          }
          that.setCartList(_cartList)
        }
      }
    }
    for (let j in _goodsList) { //减商品列表中的单个商品
      if (_goodsList[j].id == id) {
        if (_goodsList[j].number > 0) {
          --_goodsList[j].number
          that.setGoodsList(_goodsList)
        }
      }
    }
  },

  //设置购物车列表
  setCartList: function(_cartList) {
    wx.setStorageSync('cart', _cartList)
    this.setData({
      cartList: _cartList
    })
    this.countCartNum()
    this.countCartMoney()
  },

  //上拉加载更多
  getMore: function() {
    var that = this;
    that.setData({
      page: that.data.page + 1
    })
    if (that.data.page <= that.data.allpage) {
      wx.showNavigationBarLoading();
      if (!this.data.inputShowed) {
        that.getGoodsList(that.data.goodsType)

      } else {
        that.getSearchGoodsList()

      }
    } else {
      that.setData({
        hidden: !1,
      });
    }
  },

  // 预览图片
  previewImage: function(e) {
    imgFlag = !0;

    let imgurl = e.currentTarget.dataset.img
    wx.previewImage({
      urls: imgurl.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })
  },



  // 弹出框蒙层截断touchmove事件
  preventTouchMove: function() {

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


  //显示购物车
  showCart: function() {
    let _showCartModal = this.data.showCartModal
    this.setData({
      showCartModal: !_showCartModal
    })
    _showCartModal ? this.animationAction(-400) : this.animationAction(0)

  },

  //隐藏购物车
  hideCart: function() {
    this.setData({
      showCartModal: true
    })
    this.animationAction(0)
  },

  //清空购物车
  clearCart: function() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '确认清空所选商品？',
      showCancel: true,
      success: function(res) {
        if (res.confirm) {
          that.clearCartGoods()
        }
      }
    });
  },

  //计算购物车商品总金额
  countCartMoney: function() {
    var _cart = wx.getStorageSync('cart'),
      _money = 0;
    for (let i in _cart) {
      _money += +(_cart[i].price * _cart[i].number)
    }
    this.setData({
      totalMoney: parseFloat(_money).toFixed(2)
    })
  },

  //计算购物车商品总数量
  countCartNum: function() {
    var _cart = wx.getStorageSync('cart'),
      _num = 0;
    for (let i in _cart) {
      _num += +_cart[i].number
    }
    this.setData({
      totalNum: _num
    })
  },

  //清空购物车
  clearCartGoods: function() {
    wx.removeStorageSync('cart');
    this.setData({
      cartList: []
    });
    let _goodsList = this.data.goodsList
    for (let i in _goodsList) {
      _goodsList[i].number = 0
    }
    this.setGoodsList(_goodsList);
  },

  //去结算
  goToOrder: function() {
    let cartsArr = [],
      _cart = this.data.cartList;
    if (_cart.length <= 0) {
      util.showToastError('请尽情挑选您的商品^_^')
    } else {
      for (let i in _cart) {
        cartsArr.push(_cart[i].id + '*' + _cart[i].number);
      }
      let cartStr = cartsArr.join('~')
      let _storeInfo = JSON.stringify(this.data.storeInfo)
      let _roomInfo = JSON.stringify(this.data.roomInfo)

      imgFlag = !1;

      wx.navigateTo({
        url: '../orderCreate/orderCreate?carts=' + cartStr + '&storeinfo=' + _storeInfo + '&roominfo=' + _roomInfo,
      })
    }
  },

  //获取商品类目
  getGoodsNav: function() {
    let that = this;
    wx.showNavigationBarLoading();

    util.sendRequest({
      url: 'cater_area/storeType',
      data: {
        storeId: that.data.shopId,
        roomId: that.data.roomId
      },
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res);
          let _goodsType = res.result.data.categoryList
          let _storeInfo = res.result.data.storeInfo
          let _roomInfo = res.result.data.roomInfo
          that.setData({
            storeInfo: _storeInfo,
            roomInfo: _roomInfo
          })
          that.setBarTitle(_storeInfo, _roomInfo)
          that.showGoodsNav(_goodsType)
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //显示商品类目
  showGoodsNav: function(navArr) {
    let that = this
    if (navArr.length > 0) {
      let _type = navArr[0].id
      that.setData({
        goodsType: _type,
        goodsNav: navArr
      })
      that.getGoodsList(_type)
    }
  },

  //获取商品列表
  getGoodsList: function(_type) {
    let that = this,
      data = {
        storeId: that.data.shopId,
        typeId: _type,
        page: that.data.page,
        limits: that.data.limits
      }

    util.sendRequest({
      url: 'cater_area/getTypeGoodList',
      data: data,
      success: function(res) {
        wx.hideNavigationBarLoading();
        if (res.code == '00000') {
          util.setToken(res)
          let _data = res.result.data;
          that.showgoodsList(_data)
          wx.hideNavigationBarLoading();
        } else {
          util.showToastError(res.message);
        }
      }
    })
  },

  //获取搜索商品列表
  getSearchGoodsList: function() {
    let that = this,
      data = {
        storeId: that.data.shopId,
        keywords: that.data.inputVal,
        page: that.data.page,
        limits: that.data.limits
      }

    util.sendRequest({
      url: 'cater_area/searchGoods',
      data: data,
      success: function(res) {
        wx.hideNavigationBarLoading();
        if (res.code == '00000') {
          util.setToken(res)
          let _data = res.result.data;
          that.showgoodsList(_data)
          wx.hideNavigationBarLoading();
        } else {
          util.showToastError(res.message);
        }
      }
    })
  },

  //展示商品列表
  showgoodsList: function(obj) {
    let that = this
    let list = obj.goodsList;
    let _goodsList = that.data.goodsList;

    that.setData({
      allpage: obj.allpage,
      hidden: (obj.nowpage == obj.allpage ? !1 : !0),
    });

    if (list.length > 0) {
      that.setGoodsList(_goodsList.concat(list))
    } else {
      that.setData({
        hidden: !1,
      });
    }
  },


  //设置商品列表
  setGoodsList: function(_goodsList) {
    let _cartList = wx.getStorageSync('cart') || []
    for (let i in _goodsList) {
      for (let j in _cartList) {
        if (_goodsList[i].id == _cartList[j].id) {
          _goodsList[i].number = _cartList[j].number
        }
      }
    }
    this.setData({
      goodsList: _goodsList
    });

    this.countCartNum()
    this.countCartMoney()
  },

})