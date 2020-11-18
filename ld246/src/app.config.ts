export default {
  darkmode: true,
  themeLocation: "theme.json",
  pages: [
    'pages/index/index',
    'pages/domain/index',
    'pages/article/index',
    'pages/me/index',
    'pages/notifications/index',
    'pages/tagDetail/index',
    'pages/set/index',
  ],
  window: {
    navigationBarBackgroundColor: '@navBgColor',
    navigationBarTitleText: '链滴',
    navigationBarTextStyle: '@navTxtStyle'
  },
  subPackages: [
    {
      root: "pages/comments/",
      pages: [
        "index",
      ]
    },
    {
      root: "pages/meDetail/",
      pages: [
        "index",
      ]
    }
  ]
}
