import re
import requests
import csv
import lxml.html

url_template = 'http://www.weizhuos.cn/?p={}'  # 必须要加上"/?p={}"
total_num = 100000
max_fail = 500  # 最大连续失败次数


def download_page(url):
    return requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36 Edg/102.0.1245.33'
    }).text


def main():
    # 将数据导入到csv文件中
    writer = csv.writer(open('weizhuo.csv', 'w',
                             newline='', encoding='utf-8'))
    fields = ('电影名', '韦卓链接', '百度链接', '夸克链接', '迅雷链接', '其他链接')
    writer.writerow(fields)
    fail_num = 0
    for i in range(1, total_num):
        url = url_template.format(i)
        html = download_page(url)
        if "<title>" not in html or "页面不存在" in html:
            print("页面不存在" + url)
            fail_num += 1
            if fail_num == max_fail:
                break
            continue
        fail_num = 0
        tree = lxml.html.fromstring(html)
        # 获取电影名称
        title = tree.xpath('//*[@id="wbbody"]/h1/text()')  # //title/text()
        # 获取下载链接
        post_context = tree.xpath('//*[@id="post_content"]/p')
        down_baidu = ""
        down_kuake = ""
        down_xunlie = ""
        down_others = ""
        for pc in post_context:
            text = pc.text_content()
            if "视频" not in text:
                continue
            url_download = pc.xpath(".//a/@href")
            if len(url_download) == 0:
                continue
            down_info = text + " " + " ".join(url_download)
            if "百度" in text:
                down_baidu = down_info
            elif "夸克" in text:
                down_kuake = down_info
            elif "迅雷" in text:
                down_xunlie = down_info
            else:
                down_others = down_info
        # 保存结果
        info = (title, url, down_baidu, down_kuake, down_xunlie, down_others)
        print(info)
        writer.writerow(info)


if __name__ == '__main__':
    main()
