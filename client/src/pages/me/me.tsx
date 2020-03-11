// @ts-nocheck
import Taro, { Component, Config } from '@tarojs/taro'
import {View,Image} from '@tarojs/components'
import { AtButton } from 'taro-ui'

const db = wx.cloud.database()

import './me.less'

export default class Index extends Component {

  config: Config = {
    navigationBarTitleText: '个人中心'
  }

  state={
    userInfo:Taro.getStorageSync('userInfo') || {}
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  onGetUserInfo = e=>{
    let userInfo = e.detail.userInfo
    // 需要调用云函数，获取用户的openid
    wx.cloud.callFunction({
      name:'login',
      complete:res=>{
        userInfo.openid = res.result.openid
        this.setState({
          userInfo
        })
        // 写入本地缓存
        Taro.setStorageSync('userInfo', userInfo)
      }
    })
  }

  addBook(isbn){
    // 调用云函数
    wx.cloud.callFunction({
      name:'getdoubanbook',
      data:{isbn},
      success:({result})=>{
        result.userInfo = this.state.userInfo

        db.collection('doubanbooks').add({
          data:result
        }).then(res=>{
          if(res._id){
            wx.showModal({
              title:"添加成功",
              content:`《${result.title}》添加成功`
            })
          }
        })
      }
    })
    // 云函数写一个爬虫
  }
  scanCode = ()=>{
    // this.addBook('26291216')
    Taro.scanCode({
      success:res=>{
        console.log('isbn号::',res.result)
        // 图书的isbn号，去豆瓣获取详情
        this.addBook(res.result)
      }
    })
  }

  render() {
    return (
      <View class='user-container'>
        {
          this.state.userInfo.openid ? <View>
            <Image class="avatar" src={this.state.userInfo.avatarUrl}> </Image>
            <View>{this.state.userInfo.nickName}</View>
            <View>
              <AtButton type='primary' onClick={this.scanCode}>添加图书</AtButton>

            </View>
          </View> : <View>
              <Image class="avatar" src="http://image.shengxinjing.cn/rate/unlogin.png" />
              <View>
                <AtButton
                  type='primary'
                  size="small"
                  onGetUserInfo={this.onGetUserInfo}
                  openType="getUserInfo">登录</AtButton>

              </View>

            </View>
        }
        <View className="contact">
          <AtButton type='primary' openType="contact">客服</AtButton>

        </View>

      </View>
    )
  }
}
