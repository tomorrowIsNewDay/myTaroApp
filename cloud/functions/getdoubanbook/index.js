// 云函数入口文件
const axios = require('axios')
const cloud = require('wx-server-sdk')
const doubanbook = require('doubanbook')
const cheerio = require('cheerio')

cloud.init()

async function searchDouban(isbn){
  const url = "https://book.douban.com/subject_search?search_text="+isbn
  let searchInfo = await axios.get(url)
  // console.log(searchInfo.data)
  let reg = /window\.__DATA__ = "(.*)"/
  if(reg.test(searchInfo.data)){
    // 数据解密

    let searchData = doubanbook(RegExp.$1)[0]
    return searchData
  }
}

async function getDouban(isbn){
  // 第一个爬虫，根据isbn 查询豆瓣url
  let detailInfo = await searchDouban(isbn)
  console.log('detailinfo::', detailInfo.title, detailInfo.rating.value)
  let detailPage = await axios.get(detailInfo.url)
  // 下面写第二个爬虫
  // cheerio 在node李，使用jquery的语法 解析文档
  const $ = cheerio.load(detailPage.data)
  let publisher, price
  const info = $('#info').text().split('\n').map(v=>v.trim()).filter(v=>v)

  info.forEach(v => {
    const temp = v.split(':')
    if (temp[0] == '出版社') {
        publisher = temp[1]
    }
    if (temp[0] == '定价') {
        price = temp[1]
    }

  })
  
  let author = info[1]
  let tags = []

  $('#db-tags-section a.tag').each((i,v)=>{
    tags.push({
      title:$(v).text()
    })
  })

  let comments = []
  $('#comments .comment').each((i,v)=>{
    comments.push({
      author:$(v).find('.comment-info a').text(),
      content:$(v).find('.comment-content').text(),
      date:$(v).find('.comment-info span').eq(1).text()
    })
  })
  console.log(comments)
  const ret = {
    create_time : new Date().getTime(),
    title:detailInfo.title,
    rate:detailInfo.rating.value,
    image:detailInfo.cover_url,
    url:detailInfo.url,
    summary:$('#link-report .intro').text(),
    // 页面的浏览量
    count:1,
    tags,
    author,
    publisher,
    price,
    comments
  }
  console.log(ret)
  return ret
  // console.log()
  // const url = 'https://book.douban.com/subject_search?search_text='+isbn
  // let serchInfo = await axios.get(url)
  // // console.log(serchInfo.data)
  // // 获取window.__DATA__ = 后面的数据 解密 需要的 就是括号里的数据
  // let reg = /window\.__DATA__ = "(.*)"/
  // if(reg.test(serchInfo.data)){
  //   console.log(RegExp.$1)
  //   let searchData = doubanbook(RegExp.$1)
  //   console.log(searchData)
  // }
}

// 本地调试的入口
// console.log(getDouban('9787010009148'))
// 所谓的云函数 就是一个node的项目(函数)
exports.main = async (event, context)=>{
  // 云函数的逻辑
    const {isbn} = event
    return getDouban('9787010009148')
}