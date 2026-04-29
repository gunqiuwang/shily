export default {
  pages: [
    'pages/index/index',
    'pages/record/index',
    'pages/chat/index',
    'pages/data/index',
    'pages/mine/index',
    'pages/camera/index',
    'pages/weather/index',
    'pages/reminder/index',
    'pages/goal/index',
  ],
  window: {
    navigationStyle: 'custom',
    backgroundColor: '#F8FAF7',
    navigationBarBackgroundColor: '#F8FAF7',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '食律',
  },
  tabBar: {
    custom: true,
    color: '#A8B6B0',
    selectedColor: '#7BC89C',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/record/index',
        text: '记录',
      },
      {
        pagePath: 'pages/chat/index',
        text: 'Shily',
      },
      {
        pagePath: 'pages/data/index',
        text: '数据',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
}
