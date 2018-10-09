//donation.js
//获取应用实例
const app = getApp();
const util = require("../../utils/util.js");

Page({
  data: {
    num: 0,
    number: 0,
    parts: 0,
    maxParts: 10,
    disabled: false,
    isShow: true,
    sharesubname: '  点击立即抢购>>',
    shareImgUrl: app.globalData.shareImgUrl,
  },

  onLoad: function(options) {
    this.setData({
      type: options.type,
      title: options.title,
      uId: wx.getStorageSync('userInfo').id,
      uName: wx.getStorageSync('userInfo').nickname
    })
  },

  onShow: function() {
    this.getCardInfo();
  },

  //获取卡信息
  getCardInfo: function() {
    let that = this;
    util.sendRequest({
      url: 'card/getUserCardInfo',
      success: function(res) {
        if (res.code == '00000') {
          util.setToken(res);
          let cardObj = res.result.data.TcardList
          Object.keys(cardObj).length > 0 ? that.showCardInfo(cardObj) : util.showToastError('未获取卡到信息^_^')
        } else {
          util.showToastError(res.message)
        }
      }
    });
  },

  //显示卡数据信息
  showCardInfo: function(obj) {
    let that = this,
      _num = '0',
      stArr = [],
      shArr = [],
      _type = that.data.type;
    (obj.st && obj.st.length > 0) ? stArr = obj.st: stArr;
    (obj.sh && obj.sh.length > 0) ? shArr = obj.sh: shArr;
    let shtArr = stArr.concat(shArr);
    if (shtArr.length > 0)
      for (let i in shtArr)
        if (shtArr[i].type == _type) _num = shtArr[i].amount
    that.setData({
      num: parseInt(_num)
    })
  },

  bindInputNumber: function(e) {
    this.setData({
      number: e.detail.value
    });
  },

  bindInputParts: function(e) {
    this.setData({
      parts: e.detail.value
    });
  },

  //判断数值为浮点型
  isFloat: function(n) {
    return n % 1 !== 0;
  },

  checkInputRule: function() {
    if (!this.data.number || !this.data.parts || this.data.number <= 0 || this.data.parts <= 0) {
      util.showToastError('请填写有效的数量和份数！')
      return false;
    } else if (this.data.number - this.data.num > 0) {
      util.showToastError('您填写的数量超出最大可赠送数量' + this.data.num + '！')
      return false;
    } else if (this.data.parts - this.data.maxParts > 0) {
      util.showToastError('最大拆分份数为10份！')
      return false;
    } else if (this.data.number - this.data.parts < 0) {
      util.showToastError('拆分份数不能超过赠送数量！')
      return false;
    } else {
      return true;
    }
  },


  //set分享红包
  setShareRedPackets: function() {
    let flag = this.checkInputRule();
    flag && this.creatShareRedPackets();
  },

  //create分享红包
  creatShareRedPackets: function() {
    let that = this;
    that.setData({
      disabled: true
    });

    util.sendRequest({
      url: 'card/userCardSend',
      data: {
        type: that.data.type,
        number: that.data.parts,
        par_value: that.data.number
      },
      success: function(res) {
        if (res.code == '00000') {
          that.setData({
            disabled: false,
            redPacketsId: res.result.data.insertInfo,
          });
          util.setToken(res)
          that.getSharePic();
        } else {
          that.setData({
            disabled: false
          });
          util.showToastError(res.message)
        }
      }
    });
  },

  // 获取分享图片
  getSharePic: function() {
    let that = this
    this.setData({
      isShow: false
    })
    let redPacketsId = that.data.redPacketsId
    let _type = that.data.type
    let _number = that.data.number
    let parts = that.data.parts
    util.sendRequest({
      url: 'users/creatBonusImage',
      data: {
        page: "pages/red-packets/red-packets",
        scene: 'id=' + redPacketsId + '&type=' + _type,
        num: parts,
        number: _number,
        type: _type
      },
      success: function(res) {
        that.setSharePic(res)
      }
    })
  },


  // 设置分享图片
  setSharePic: function(res) {
    if (res.code == '00000') {
      util.setToken(res)
      this.setData({
        shareQrcodeImg: this.data.shareImgUrl + res.result.data.imgurl
      })
    } else {
      util.showToastError(res.message);
    }
  },

  // 关闭图片
  closeShare: function() {
    this.setData({
      isShow: true,
      number: 0,
      parts: 0
    })
    this.getCardInfo();
  },


  // 预览图片
  previewImage: function(e) {
    let imgurl = this.data.shareQrcodeImg
    wx.previewImage({
      urls: imgurl.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })
  },

  // 保存图片
  saveTap: function() {
    let imgurl = this.data.shareQrcodeImg
    wx.downloadFile({
      url: imgurl,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            util.showToastSuccess("保存成功");
          },
          fail: function(res) {
            util.showToastError("保存失败");
          }
        })
      },
      fail: function() {

      }
    })
  },

  //设置页面分享数据
  onShareAppMessage: function() {
    return {
      title: this.data.uName + '分享给您' + this.data.title + '大礼包  ' + this.data.sharesubname,
      path: '/pages/red-packets/red-packets?id=' + this.data.redPacketsId + '&type=' + this.data.type,
      imageUrl: this.data.shareQrcodeImg,
      success: function(res) {
        util.showToastSuccess('分享成功！')
        console.log('分享成功', res)
      },
      fail: function(res) {
        console.log('分享取消', res)
        // 转发失败
      }
    }
  },

})