//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    slideImgArr: [
      'https://qbkeass.cn/images/games/visualSearch/instance01.png',
      'https://qbkeass.cn/images/games/visualSearch/instance02.png',
      'https://qbkeass.cn/images/games/visualSearch/instance03.png'],//之后再插入游戏图片
    indicatorDots: true, // 是否显示面板指示点
    autoplay: true,      // 是否自动切换
    circular: true,      // 是否采用衔接滑动
    interval: 3000,      // 自动切换时间间隔
    duration: 1000,      // 滑动动画时长
  
    startGame: false, //是否开始游戏
    gameHeight: '0',

    time:'100',//限定时间100s
    timer:null,

    arr : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i','j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't','u', 'v', 'w', 'x', 'y', 'z','A', 'B', 'C', 'D', 'E','F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P','Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    // rgbArr:['rgb(254,67,101)','rgb(252,157,154)','rgb(249,205,173','rgb(200,200,169)','rgb(131,175,155)'],
    rgbArr:['#47b8e0','#ef5285','#79bd9a','#fcbe32','#ef5285'],
    wordArr:[],
    requestWord:null,
    hint:"点击一个方块尝试一下吧",
    difficulty:4,

    finish:false,
    totalRight:0,//1～3轮总共选对的
    totalWrong:0,//1～3轮总共选错的
    totalRequest:0,//1～3轮总共需要找到的（标准答案总数）

    progressWidth:0,
    marginLeft:-10,
    rightRate:0,//正确率
    score:0,//分数
    grade:'',//等级
    gradeImg:'',

    gradeShow:false,
    score_show:false,

    testFlag:0,

  },

  onLoad: function (option) {//页面打开时执行的操作
    //每个手机的屏幕宽度是750rpx 分辨率不一致
    //所有手机在小程序中的宽:真实宽度=小程序在页面中的高度:真实高度
    var res = wx.getSystemInfoSync();
    var rate = 750/res.windowWidth;
    this.createArr();
    this.setData({
      rate:rate,
      gameHeight : rate*res.windowHeight,
      testFlag:option.testFlag,
    })
    console.log(this.data.testFlag)
  },
  createArr:function(){
    var tempArr = [];
    var colorArr = this.data.rgbArr;
    var arr1 = this.data.arr;
    var random1 = Math.floor(Math.random()*52);
    var random2 = Math.floor(Math.random()*52);
    
    var searchWord = arr1[random1]+arr1[random2];
    //1-3个随机字母对
    
    var count = 0;
    var countRandom;
    var d = this.data.difficulty;
    var totalRequest = this.data.totalRequest;
    if(d==4){
      countRandom = Math.floor(Math.random()*(3-2)+2);
    }else if(d==5||d==6){
      countRandom = Math.floor(Math.random()*(4-3)+3);
    }
    totalRequest = totalRequest+countRandom;
    while(count<d*d){
        random1 = Math.floor(Math.random()*52);
        random2 = Math.floor(Math.random()*52);
        var word = arr1[random1]+arr1[random2];
        
        if(word==searchWord)//保证生成的数字不是要找的数字
          continue;
        var colorRandom = Math.floor(Math.random()*5);
        var color = colorArr[colorRandom];
        var x = {text:word, active:0, color:color}
        tempArr.push(x);
        count++
    }
    count = 0;
    while(count<countRandom){
      var random = Math.floor(Math.random()*d*d);
      if(tempArr[random].text==searchWord)
        continue;
      var colorRandom = Math.floor(Math.random()*5);
      var color = colorArr[colorRandom];
      var x = {text:searchWord,active:0,color:color}
      tempArr[random]=x;
      count++;
    }
    this.setData({
      wordArr: tempArr,
      totalRequest:totalRequest,
      requestWord:searchWord
    })
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  start:function(e){
    console.log("start")
    //当开始游戏按钮被点击时，隐藏视觉搜索介绍
    this.setData({
      startGame:true,
    })
    this.drawActive();
  },
  drawActive:function(){
    var this2 = this;
    var progressWidth = this.data.progressWidth;
    var timer = setInterval(function(){
      if(progressWidth==100){
        clearInterval(this2.data.timer);
        this2.getScore();
        this2.getGrade();
        this2.showGrade();
      }else{
        progressWidth++;
        this2.setData({
          progressWidth:progressWidth,
          marginLeft:550/100*progressWidth-10
        })
      }
    },1000);
    this.setData({
      timer:timer
    })
    

  },
  clickWord:function(e){
    const id = e.currentTarget.dataset.index;
    var arr = this.data.wordArr;
    var word = this.data.requestWord;
    var right = this.data.totalRight;
    var wrong = this.data.totalWrong;
    if(arr[id].active == 1){
      arr[id].active = 0;
      right--;
    }else if(arr[id].active == 2){
      arr[id].active = 0;
      wrong--;
    }else if(arr[id].text==word){
      arr[id].active = 1;
      right++;
    }else{
      arr[id].active = 2;
      wrong++
    }
    var d = this.data.difficulty;
    var hint;
    if(d==4||d==5){
      hint='如果觉得选完了，就点击"下一题"吧！'
    }else{
      hint='如果觉得选完了，就点击"完成"吧！'
    }
    
    this.setData({
      wordArr:arr,
      totalRight:right,
      totalWrong:wrong,
      hint:hint
    })
    
  },
  next:function(){
    var d = this.data.difficulty;
    var this2 = this;
    clearInterval(this2.data.timer);
    wx.showModal({
      title: '是否进入下一轮',
      content: '进入下一轮后，你将无法修改本轮答案',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          console.log('用户点击确定');
          this2.upgrade();
          this2.drawActive();
        } else {//这里是点击了取消以后
          console.log('用户点击取消');
          this2.drawActive();
        }
      }
    });
    
    
  },
  finish:function(){
    var this2 = this;
    clearInterval(this2.data.timer);
    wx.showModal({
      title: '是否结束本轮',
      content: '结束后，你将无法修改本轮答案',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          console.log('用户点击确定');
          this2.getScore();
          this2.getGrade();
          this2.showGrade();
        } else {//这里是点击了取消以后
          console.log('用户点击取消');
          this2.drawActive();
        }
      }
    });
    
  },
  getScore:function(){
    var useTime = this.data.progressWidth;
    console.log(useTime)
    console.log('resuqest:'+this.data.totalRequest);
    console.log('right:'+this.data.totalRight);
    console.log('wrong:'+this.data.totalWrong);
    var rightRate = 1.0*(this.data.totalRight-this.data.totalWrong)/this.data.totalRequest;
    if(rightRate<0){
      rightRate=0;
    }
    var score =rightRate*(100-useTime+20);
    console.log('视觉搜素:'+score);
    this.setData({
      rightRate:rightRate,
      score:score
    })
  },
  getGrade:function(){
    var score = this.data.score;
    wx.setStorage({key: "hasShijue", data: true})
    wx.setStorage({key: "shijue", data: score})
    var grade = '';
    var gradeImg = '';
    if(score>=90)
    { 
      grade = 'A'; 
      gradeImg = 'https://qbkeass.cn/images/level/level-A.png'
    }else if(score<90&&score>=75) {
      grade = 'B'; 
      gradeImg = 'https://qbkeass.cn/images/level/level-B.png'
    }else if(score<75&&score>=60) { 
      grade = 'C'; 
      gradeImg = 'https://qbkeass.cn/images/level/level-C.png'
    }else{ 
      grade = 'D'; 
      gradeImg = 'https://qbkeass.cn/images/level/level-D.png'
    }
    this.setData({
      grade:grade,
      gradeImg:gradeImg
    })
    console.log("等级："+grade);
  },
  showGrade:function(){
    this.setData({
      gradeShow:true,
      score_show:true,
    })
    setTimeout(() => this.exit(), 2500);
  },
  upgrade:function(){
    var d = this.data.difficulty;
    d++;
    this.setData({
      difficulty:d
    })
    this.createArr();
    if(d==6){
      this.setData({
        finish:true,
        hint:'如果觉得选完了，就点击"完成"吧！'
      })
    }
  },
  exit:function(){//点击确定后
    clearInterval(this.data.timer)
    //跳转到游戏界面
    if(this.data.testFlag==0)
    {
      wx.switchTab({
        url: '/pages/games/index',
      })
    }else if(this.data.testFlag==1){
      wx.redirectTo({
        url: '/pages/games/Matrix_pro/Matrix_pro?testFlag=1',
      })
    }else{
      wx.redirectTo({
        url: '/pages/games/Matrix_pro/Matrix_pro?testFlag=2',
      })
    }
  },
  onHide:function(){
    clearInterval(this.data.timer);
  },
  onUnload:function(){
    clearInterval(this.data.timer);
  }
  
},

  
)
