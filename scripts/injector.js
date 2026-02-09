// 注入彩虹加载动画
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.bodyBegin.file('loader', 'source/html/RainbowLoading.html');
});