//@ts-nocheck
import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {AtTag,AtCard,AtTextarea,AtButton} from 'taro-ui'
import dayjs from 'dayjs'
import './detail.less'
let db = wx.cloud.database()

class Index extends Component {

  config = {
    navigationBarTitleText: '详情页'
  }
  state={
    userInfo:Taro.getStorageSync('userInfo') || {},

    book:{},
    value:''
  }
  componentWillMount () { }

  componentWillReact () {
    console.log('componentWillReact')
  }
  init(){
    let id = this.$router.params.id
    Taro.showLoading()
    db.collection('doubanbooks').doc(id).get().then(res=>{
      this.setState({
        book:res.data
      })
      Taro.setNavigationBarTitle({
        title:res.data.title
      })
      Taro.hideLoading()
    })

  }
  componentDidMount () {
    // 图书的唯一标识
    let id = this.$router.params.id

    // 1. 图书的count +1
    db.collection('doubanbooks').doc(id).update({
      data:{
        count: db.command.inc(1)
      }
    })
    this.init()
    console.log(id)

  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleChange= e=>{
    this.setState({
      value:e.target.value
    })
  }
  comment = ()=>{
    let id = this.$router.params.id
    Taro.showLoading()
    db.collection('doubanbooks').doc(id).update({
      data:{
        comments:db.command.push({
          "author": this.state.userInfo.nickName,
          "content": this.state.value,
          "date": new Date()
        })
      }
    }).then(res => {
      console.log('commonet::', res)
      let ncoms = this.state.book.comments.push({
        "author": this.state.userInfo.nickName,
        "content": this.state.value,
        "date": new Date()
      })

      this.setState({
        value: '',
      })
      this.init()

      Taro.hideLoading()
    })
  }
  render () {
    console.log(this.state.book)
    let rate = Math.round(this.state.book.rate / 2)
    let rateVal = "★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);
    let {userInfo} = this.state.book
    const { book } = this.state

    return (
      <View className='container'>
        <View className='thumb'>
          <Image className="back" src={this.state.book.image} mode='aspectFill'></Image>
          <Image className="img " src={this.state.book.image} mode="aspectFit"></Image>
        </View>

        <View>
          {
            book.tags.map(t=>{
              return <AtTag active circle> {t.title}</AtTag>
            })
          }
        </View>
        <View>
          {
            book.comments.map(c=>{
              let image = c.image ? c.image : 'http://image.shengxinjing.cn/rate/unlogin.png'
              return <AtCard
                title={c.author}
                extra={c.data}
                thumb={image}
              >
              {c.content}
              </AtCard>
            })
          }
        </View>

        {
          this.state.userInfo.openid && <View className="commentView">

            <AtTextarea
              value={this.state.value}
              onChange = {this.handleChange}
            >

            </AtTextarea>
            <AtButton type='primary' onClick={this.comment}>提交</AtButton>
          </View>
        }
      </View>
    )
  }
}

export default Index
