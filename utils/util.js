const apiBase = 'https://ktv.whfhnd.cn/api/';
//const apiBase = 'https://ktv.puqikeji.com/api/';

const sendRequest = (param, customSiteUrl) => {
  var data = param.data || {},
    header = param.header,
    requestUrl;

  if (customSiteUrl) {
    requestUrl = customSiteUrl + param.url;
  } else {
    requestUrl = apiBase + param.url;
  }

  if (param.method) {
    if (param.method.toLowerCase() == 'get') {
      header: header || {
        'content-type': 'application/json',
        'AUTHORITY': wx.getStorageSync("token")
      }
    }
    param.method = param.method.toUpperCase();
  }

  if (param.hideLoading) {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    });
  }
  wx.request({
    url: requestUrl,
    data: data,
    method: param.method || 'POST',
    header: header || {
      'content-type': 'application/x-www-form-urlencoded;',
      'AUTHORITY': wx.getStorageSync("token")
    },
    success: function(res) {
      wx.hideLoading();
      if (res.statusCode && res.statusCode != 200) {
        showToastError(res.errMsg);
        return;
      }
      if (res.data.code) {
        console.log(res.data)
        typeof param.success == 'function' && param.success(res.data);
      }
    },
    fail: function(res) {
      typeof param.fail == 'function' && param.fail(res.data);
    },
    complete: function(res) {
      typeof param.complete == 'function' && param.complete(res.data);
    }
  });
}

const showToastSuccess = (msg) => {
  wx.showToast({
    title: msg,
    icon: 'success',
    duration: 2000
  })
}

const showToastError = (msg) => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 3000
  })
}


const setToken = (res) => {
  wx.setStorageSync("token", res.result.token)
}

const mobileToStar = (mobile) => {
  var str = mobile.substring(0, 3) + "****" + mobile.substring(7, 11);
  return str;
}

const throttle = (fn, gapTime) => {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}

const checktime = (i) => {
  if (i < 10 && i != 0)
    i = "0" + i;
  else
    i = i;
  return i;
}

const strToObj = (str) => {
  let obj = {},
    _str = decodeURIComponent(str),
    _arr = _str.split('&');
  for (let i in _arr) {
    obj[_arr[i].split("=")[0]] = _arr[i].split("=")[1];
  }
  return obj;
}

module.exports = {
  sendRequest: sendRequest,
  setToken: setToken,
  showToastSuccess: showToastSuccess,
  showToastError: showToastError,
  mobileToStar: mobileToStar,
  throttle: throttle,
  checktime: checktime,
  strToObj: strToObj,
}