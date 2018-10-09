const app = getApp()
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '',
    showRecordModal:true,
 
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getRewardInfo()
  },
  getRewardInfo: function() {
    let that = this;
    util.sendRequest({
      url: 'shop_card/memberInfo',
      success: function(res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            money: res.result.data.wtInfo.moneycount,
            wtInfo: res.result.data.wtInfo,
            awardList: res.result.data.awardList,
            rStatus: res.result.data.wtInfo.status

          })
        }
      }
    })
  },
  //申请提现
  rewardAction: function(res) {
    let status=res.currentTarget.dataset.status
    if(status==0){
      util.showToastError('请到门店提现后 再去提现')
    }else{
      let that = this
      util.sendRequest({
        url: 'shop_card/getMemberWithdrawList',
        success: function (res) {
          if (res.code === '00000') {
            util.setToken(res)
            that.setData({
              rewardList: res.result.data.wList,
              eventLog: 1,
            })
            that.showRedRecord()
          }
        }
      })
    }
  
  },
  //选择门店提现
  toShopReward:function(res){
    
    let storeid = res.currentTarget.dataset.storeid
    let money = res.currentTarget.dataset.money
    let storesname = res.currentTarget.dataset.storesname
    let that = this
    util.sendRequest({
      url: 'shop_card/withdraw',
      data:{
        store_id: storeid
      },
      success: function (res) {
        if (res.code === '00000') {
          util.setToken(res)
          wx.navigateTo({
            url: '../rewardsSuccess/rewardsSuccess?money=' + money + '&storesname=' + storesname ,
          })
        }
      }
    })

   
  },

  //提现记录 1 是审核中 2 已提现 3 已拒绝
  rewardReward:function(){
    let that = this
    util.sendRequest({
      url: 'shop_card/getMemberWithdrawLogList',
      success: function (res) {
        if (res.code === '00000') {
          util.setToken(res)
          that.setData({
            rewardList: res.result.data.wList,
            eventLog:2
          })
          that.showRedRecord()
        }
      }
    })
  },
animationAction: function (y) {
    var animation = wx.createAnimation({
      timingFunction: 'ease'
    })
    this.animation = animation
    animation.translateY(y).step()
    this.setData({
      animationData: animation.export()
    })
  },


  //显示领取记录
  showRedRecord: function () {
    this.setData({
      showRecordModal: false
    })
    this.animationAction(-500)
  },

  //隐藏领取记录
  hideRedRecord: function () {
    this.setData({
      showRecordModal: true
    })
    this.animationAction(0)
  },

})