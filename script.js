const markdownTable = require('markdown-table');
const fs = require('fs');
const data = fs.readFileSync('./where-is-top250.csv');
const rows = data.toString().split('\n');
rows.shift();
const table = rows.map(row => row.split(',').map(column => column.trim()));
const newTable = table.map(row => {
  const rate = row[2];
  const doubanLink = row[8];
  const linkMap = {
    'miguvideo.com': {
      url: '',
      badge: 'https://shields.io/badge/-咪咕视频-EA4335?logo=Gmail&logoColor=white&style=flat'
    },
    'v.qq.com': {
      url: '',
      badge: 'https://shields.io/badge/-腾讯视频-3199fa?logo=Tencent%20QQ&logoColor=white&style=flat'
    },
    'v.youku.com': {
      url: '',
      badge: 'https://shields.io/badge/-优酷-f9005c?logo=YouTube%20Music&logoColor=white&style=flat',
    },
    'iqiyi.com': {
      url: '',
      badge: 'https://shields.io/badge/-爱奇艺-689b33?logo=QuickTime&logoColor=white&style=flat',
    },
    'ixigua.com': {
      url: '',
      badge: 'https://shields.io/badge/-西瓜视频-fb0058?logo=Headspace&logoColor=white&style=flat'
    },
    'bilibili.com': {
      url: '',
      badge: 'https://shields.io/badge/-哔哩哔哩-fb7299?logo=bilibili&logoColor=white&style=flat'
    },
  };
  const enable_str = row[9] || '';
  const enable_urls = enable_str.split(';');

  for (let i = 0; i < enable_urls.length; i++) {
    const keys = Object.keys(linkMap);
    const url = enable_urls[i];
    for (let j = 0; j < keys.length; j++) {
      if (url.indexOf(keys[j]) >= 0) {
        linkMap[keys[j]]['url'] = decodeURIComponent(url);
        break;
      }
    }
  }
  
  const doubanBadge = `https://shields.io/badge/豆瓣-${rate}-00B51D?logo=douban&logoColor=white&style=flat`;
  const badges = Object.keys(linkMap)
    .filter(key => linkMap[key]['url'] !== '')
    .map(key => `<a href="${linkMap[key]['url']}"><img src="${linkMap[key]['badge']}"></a>`);
  badges.unshift(`<a href="${doubanLink}"><img src="${doubanBadge}"></a>`);
  const badgeMD = badges.join('&nbsp;');
  return [row[0], row[1], row[7], badgeMD];
});
const tableContentInMD = markdownTable([['排名', '电影名称', '推荐语', '相关链接'], ...newTable]);

const readme = `
# Where is top 250 movie ?

本仓库整理了腾讯视频、爱奇艺、优酷、哔哩哔哩等视频网站中，能够观看的「**豆瓣电影 Top250 榜单**」影片，点击 Badge 可跳转至相应的电影首页，👏 欢迎一同维护。

> 更新于 ${new Date().toLocaleDateString()}，想起来了就会手动更新，请持续关注。

## 电影列表

${tableContentInMD}

上述列表的生成可以使用如下命令
python script.py
npm i markdown-table
npm i repeat-string
nodejs script.js

`;

fs.writeFileSync('./README.md', readme, 'utf8');
