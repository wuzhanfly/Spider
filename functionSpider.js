

let http = require('http');
let iconv = require('iconv-lite');
let cheerio = require("cheerio");
let fs = require('fs');
let path = require('path');


//1. 先拿到目标网址的html内容
http.get("http://www.27270.com/ent/meinvtupian/", res => {
    let data = []; // 用来存放所有的chunk
    res.on('data', chunk => {
        data.push(chunk)
    });
    res.on('end', () => {
        //2. 如果网页内容有乱码，就进行乱码的处理
        // 对data进行解码
        let html = iconv.decode(Buffer.concat(data), "gbk");
        // console.log(html);
        //3. 从html的dom结构中提取出需要的数据，就是图片的src和标题
        let imgData = extraDataFromHtml(html);
        // console.log(imgData);

        //4. 进行下载图片
        downloadImage(imgData);

    });
});

/**
 * 从html中提取数据
 * @param html
 */
function extraDataFromHtml(html) {
    let $ = cheerio.load(html);
    let arr = $('div.MeinvTuPianBox>ul>li>a>i>img').toArray();
    let imgData = []
    for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        let src = $(obj).attr("src");
        let title = $(obj).attr("alt");
        // console.log(`src: ${src}  title: ${title}`);
        imgData.push({
            src, title
        })
    }
    return imgData
}

/**
 * 下载图片
 * @param imgData
 */
function downloadImage(imgData) {
    imgData.forEach(imgObj => {
        http.get(imgObj.src, res => {
            // res本质是一个reader
            let imgPath = path.join("imgs", imgObj.title + path.extname(imgObj.src))
            let writer = fs.createWriteStream(imgPath);
            res.pipe(writer);
        });
    });
}

