let http = require('http');
let fs = require('fs');
let iconv = require('iconv-lite');
let eventEmitter = require('events');
let cheerio = require('cheerio');
let path = require('path');


class Myevens extends eventEmitter {

    getHtml() {
        http.get('http://www.27270.com/ent/meinvtupian/', res => {
            let data = [];
            res.on('data', chunk => {
                data.push(chunk)
            })
            res.on('end', () => {
                //解決亂碼  data先解碼
                let html = iconv.decode(Buffer.concat(data),'gbk')
                console.log("ooooooooo"+html);
                this.emit('gethtmlfinish',html)

            })

        })
    }
    //從html抽取數據
    extraDataFormHtml(html){
        let $ = cheerio.load(html)
//body > div.w1200.yh > div.MeinvTuPianBox > ul > li:nth-child(21) > a.MMPic > i
       let arr =  $('div.MeinvTuPianBox>ul>li>a>i>img').toArray()
        let imgarr = []
        for(let i=0;i<arr.length;i++){
            let obj = arr[i]
            let src = $(obj).attr("src")
            let title = $(obj).attr("alt")
            console.log(`src:  ${src}  title: ${title}`)
            imgarr.push({
                src,
                title
        }
            )

        }
        this.emit('extraDataFormHtml',imgarr)



    }
    downloadImg(imgarr) {
        imgarr.forEach(img => {
            http.get(img.src, res => {
                // res本质是一个reader
                let imgPath = path.join("img", img.title + path.extname(img.src))
                let writer = fs.createWriteStream(imgPath);
                res.pipe(writer);
            });
        });
    }

    /*監聽器注冊*/
    start(){
        this.on('gethtmlfinish',(html)=>{
            /*調用extraDataFormHtml*/
            this.extraDataFormHtml(html)
        })
        this.on('extraDataFormHtml',(imgarr)=>{
            this.downloadImg(imgarr)
        })
        this.getHtml()
    }

}
let spider = new Myevens();
spider.start();
