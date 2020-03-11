// @ts-nocheck
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Swiper, SwiperItem } from '@tarojs/components'
import { AtCard } from "taro-ui"
import './index.less'

const db = wx.cloud.database()

export default class Index extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页',
    enablePullDownRefresh: true
  }

  componentWillMount () {
    this.getList(true)
    this.getTop()
   }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  state = {
    books: [],
    page: 0,
    tops: [[], [], []]
  }
  onPullDownRefresh() {
    this.getTop()
    this.getList(true)
  }
  onReachBottom() {
    this.setState({
      page: this.state.page + 1
    }, () => {
      this.getList()
    })
  }
  /** 获取轮播图数据 */
  getTop() {
    // lodash的chunk函数
    db.collection('doubanbooks').orderBy('count', 'desc').limit(9).get().then(res => {
      this.setState({
        tops: [res.data.slice(0, 3), res.data.slice(3, 6), res.data.slice(6)]
      })
    })
  }

  /** 获取列表数据 */
  getList = (init) => {
    Taro.showLoading()
    // init 是不是初始化 初始化直接渲染 不考虑分页
    if (init) {
      this.setState({
        page: 0
      })
    }
    // 第一页  0-3
    // 第二页  3-6
    // 第三页 6-9
    const PAGE = 10

    const offset = init ? 0 : this.state.page * PAGE

    let ret = db.collection('doubanbooks')
      .orderBy('create_time', 'desc')
    if (this.state.page > 0) {
      // 不是第一页
      ret = ret.skip(offset)
    }
    ret = ret.limit(PAGE).get().then(res => {
      console.log(res)
      if (init) {
        this.setState({
          books: res.data
        })
      } else {
        // 加载下一页
        this.setState({
          books: [...this.state.books, ...res.data]
        })
      }
      Taro.hideLoading()
    })
  }
  toDetail = (id) => {
    Taro.navigateTo({
      url: "/pages/detail/detail?id=" + id
    })
  }

  render() {
    return (
      <View className='index'>

        <Swiper
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular
          indicatorDots
          autoplay>

          {this.state.tops.map(item => {
            return <SwiperItem>

              {item.map(img => {
                return <Image
                  className='slide-image'
                  mode='aspectFit'
                  src={img.image}
                />
              })}

            </SwiperItem>
          })}

        </Swiper>

        {this.state.books.map(book => {
          let rate = Math.round(book.rate / 2)
          let rateVal = "★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);
          // let rate =
          return <View class='book-item'>
            <AtCard
              onClick={() => this.toDetail(book._id)}
              extra={rateVal}
              title={book.title}
              thumb={book.userInfo.avatarUrl}
            >
              <View>

                <View className='at-row'>
                  <View className='at-col at-col-3'>
                    <Image mode='aspectFit' class="book-img" src={book.image}></Image>
                  </View>
                  <View className='at-col at-col-1'></View>
                  <View className='at-col at-col-8'>
                    <View>
                      {book.author}
                    </View>
                    <View>
                      {book.publisher}
                    </View>
                    <View>
                      {book.price}
                    </View>
                    <View>
                      浏览量{book.count}
                    </View>
                  </View>
                </View>

              </View>
            </AtCard>


          </View>
        })}
      </View>
    )
  }
}
