const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgService,
    perNum: '请选择 >',
    inputPerNum: '',
    index: null,
    maxPerson: 2, //包房人数最大值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _carts = options.carts,
      _storeinfo = JSON.parse(options.storeinfo),
      _roominfo = JSON.parse(options.roominfo);
    console.log(_carts)
    this.setData({
      carts: _carts,
      storeInfo: _storeinfo,
      roomInfo: _roominfo,
    })

    this.getOrderInfo()

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //this.setSelectPersonNum()

  },


  //设置包厢人数选择值
  setSelectPersonNum: function() {
    let _perArrNum = [],
      max = this.data.maxPerson;
    for (let i = 1; i <= max; i++) {
      _perArrNum.push(i + '人')
    }
    _perArrNum.push('其他')
    this.setData({
      perArrNum: _perArrNum
    })
  },

  //选择包厢人数
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value,
      perNum: this.data.perArrNum[e.detail.value]
    })
  },

  //输入框包厢人数
  changePersonNum: function(e) {
    this.setData({
      inputPerNum: e.detail.value
    })
  },

  // 获取订单信息
  getOrderInfo: function() {
    let that = this
    util.sendRequest({
      url: 'card/getUserCardInfo',
      data: {
        carts: that.data.carts
      },
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res);
          let goodsType = res.result.data.TcardList

          that.setData({

          })
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },



  //下单前校验
  checkData: function() {
    let val = this.data.index
    let max = this.data.maxPerson
    let inputVal = this.data.inputPerNum
    if (!val) {
      util.showToastError('请选择包房人数，方便为您提供配具！')
      return false;
    } else if (val == max && !/^[1-9]\d*$/.test(inputVal)) {
      util.showToastError('请输入有效的人数，方便为您提供配具！')
      return false;
    } else {
      return true;
    }
  },

  //创建订单
  orderCreatePay: function() {
    let flag = this.checkData()
  },

  //订单支付
  orderPay: function() {
    util.sendRequest({
      url: '_url',
      data: {},
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          let _body = '您已成功支付' + _money;
          let _ordersn = res.result.data.payInfo.order_sn
          app.wxInterface(that, _body, _money, _ordersn)
        } else {
          util.showToastError(res.message)
        }
      }
    })
  },

})