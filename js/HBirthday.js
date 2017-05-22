/*
* HBirthday 移动端日历插件
* @tips 插件需要和viewport一起使用,可以使用AMD或CMD模块加载,PC端需要在响应式模式下查看
* @author Eddie
* @time 2017-05-22
* @version 1.0
*
* @param {number} startYear 1970,选填,开始的年份
* @param {number} endYear 默认为今年,选填,结束的年份
* @param {function} callback 选填,点击确定后的回调函数
* */
;(function(){
    function HDate(options){
        /*
        *DOM and base
        */
        var main = document.getElementById('Hbirth');
        var self = this;
        this.dpr = document.documentElement.getAttribute('data-dpr') || 1;
        this.main = main;
        this.container = main.getElementsByClassName('Hbirth-container')[0];
        this.cancelBt = main.getElementsByClassName('Hbirth-cancel')[0];
        this.confirmBt = main.getElementsByClassName('Hbirth-confirm')[0];
        this.yearDom =  main.getElementsByClassName('Hbirth-year')[0];
        this.monthDom =  main.getElementsByClassName('Hbirth-month')[0];
        this.dateDom =  main.getElementsByClassName('Hbirth-date')[0];
        this.yearList = '';
        this.monthList = '';
        this.dateList = '';
        this.oldY = 0;
        this.isIphone = /iP(ad|hone|od)/.test(navigator.userAgent) && /iP(ad|hone|od)/.test(navigator.platform);
        /*
        *可定义参数
        **/
        this.now = new Date();
        this.nowYear = this.now.getFullYear();
        this.nowMonth = this.now.getMonth();//0~11
        this.noeDate = this.now.getDate();
        if(options){
            this.startYear = options.startYear || 1970;
            this.endYear = options.endYear || this.nowYear;
            this.callback = options.callback || null;
        }

        if(main.getAttribute('data-status') === '0'){
            this.creatDate();
        }
        this.startAnim();
        
        this.cancelBt.addEventListener('click', function(){
            self.close();
        });
        this.confirmBt.addEventListener('click', function(){
            self.close();
            /*拿选中的数据,以数组形式*/
            var selectedYear = self.yearDom.getElementsByClassName('highlight')[0].getAttribute('data-value');
            var selectedMonth = self.monthDom.getElementsByClassName('highlight')[0].getAttribute('data-value');
            var selectedDate = self.dateDom.getElementsByClassName('highlight')[0].getAttribute('data-value');
            var arr = [selectedYear,selectedMonth,selectedDate];
            self.callback(arr.join('-'));
        });
        main.addEventListener('click', function(evt){
            var target = evt.target;
            if(target.classList.contains('Hbirth')){
                self.close();
            }
        });
        main.addEventListener('touchmove', function(evt){
            evt.preventDefault();
        });
    }
    /*启动动画*/
    HDate.prototype.startAnim = function(){
        var self = this;
        self.main.style.display = 'block';
        setTimeout(function(){
            self.container.classList.add('Hbirth-container-show');
        });
    }
    /*生成年月*/
    HDate.prototype.creatDate = function(){
        var self = this,
            start = self.startYear,
            end = self.endYear,
            yearDom = self.yearDom,
            monthDom = self.monthDom,
            obj = {},
            arr = [];
        for(var i = start;i <= end; i++){
            obj = {};
            obj.text = i+'年';
            obj.id = i;
            arr.push(obj);
        }
        self.creatList(yearDom,arr);

        arr = [];
        for(var i = 1;i <= 12; i++){
            obj = {};
            obj.text = i+'月';
            obj.id = i;
            arr.push(obj);
        }
        self.creatList(monthDom,arr);

        self.getDateList(self.startYear,1);
        self.main.setAttribute('data-status',1);
    }
    /*生成具体月份的日期*/
    HDate.prototype.getDateList = function(year, month){
        var self = this,
            dateDom = self.dateDom,
            height = 90 * self.dpr,
            date = new Date(year, month, 0),
            Maxdate = date.getDate(),
            obj = {},
            arr = [];
        for(var i=1;i<=Maxdate;i++){
            obj = {};
            obj.text = i+'日';
            obj.id = i;
            arr.push(obj);
        }
        self.creatList(dateDom,arr);
        dateDom.style.transform = 'perspective(1000px) rotateX(0deg)';
        dateDom.style.webkitTransform = 'perspective(1000px) rotateX(0deg)';
    }
    /*传入的数据数组是这样的[{id:'1',text:'1993年'}]*/
    HDate.prototype.creatList = function(dom, arr){
        var self = this,
            html = '',
            length = arr.length,
            height = 90 * self.dpr,
            style1 = 'transform-origin: center center -'+height+'px;-webkit-transform-origin: center center -'+height+'px;';
        if(self.isIphone){
            for(var i=0;i<length;i++){
                html += '<li style="'+style1+'transform: translateZ(0) rotateX(-'+ 20*i +'deg);-webkit-transform: translateZ(0) rotateX(-'+ 20*i +'deg);" data-value="'+arr[i].id+'">'+arr[i].text+'</li>';
            }
        }
        else{
            for(var i=0;i<length;i++){
                html += '<li style="'+style1+'transform: translateZ('+height+'px) rotateX(-'+ 20*i +'deg);-webkit-transform: translateZ('+height+'px) rotateX(-'+ 20*i +'deg);" data-value="'+arr[i].id+'">'+arr[i].text+'</li>';
            }
        }
        dom.innerHTML = '';
        dom.insertAdjacentHTML('afterbegin', html);

        var arr = dom.getElementsByTagName('li');
        self.draw(arr);
        /*传进滚动对象容器*/
        var object = {dom: dom.parentElement,oldY: 0};
        self.addEvent(object);
    }
    /*描高亮和显示*/
    HDate.prototype.draw = function(arr,index){
        index = index ? index : 0;
        var length = arr.length,
            seeLength = 4,
            curIndex = index,
            maxIndex = index + seeLength,
            minIndex = index - seeLength;

        for(var i=0;i<length;i++){
            arr[i].classList.remove('visible');
            arr[i].classList.remove('highlight');
        }
        if(index >= length){
            arr[length-1].classList.add('highlight');
            arr[length-1].classList.add('visible');
            return
        }
        else if(length < 0){
            arr[0].classList.add('highlight');
            arr[0].classList.add('visible');
            return
        }
        arr[index].classList.add('highlight');
        arr[curIndex].classList.add('visible');
        while(curIndex < maxIndex){
            curIndex++;
            if(curIndex > length - 1) break;
            arr[curIndex].classList.add('visible');
        }
        curIndex = index;
        while(curIndex > minIndex){
            curIndex--;
            if(curIndex < 0) break;
            arr[curIndex].classList.add('visible');
        }
    }
    /*添加滑动事件*/
    HDate.prototype.addEvent = function(obj){
        var self = this,
            container = obj.dom,
            pointTo = container.getElementsByTagName('ul')[0],
            isYear = container.getAttribute('data-id') === 'picker-y',
            isMonth = container.getAttribute('data-id') === 'picker-m',
            pointToList = pointTo.getElementsByTagName('li'),
            pointToLength = pointToList.length,
            topLine = (pointToLength-1) * 20,
            touchSY = 0,
            touchEY = 0,
            diffY;

        container.addEventListener('touchstart', function(evt){
            evt.preventDefault();
            var touches = evt.touches[0] ||  evt.changedTouches[0];
            touchSY = touches.clientY;
        })
        
        container.addEventListener('touchmove', function(evt){
            evt.preventDefault();
            var target = evt.target,
                touches = evt.touches[0] ||  evt.changedTouches[0],
                touchY = touches.clientY,
                round = 0;
            diffY = obj.oldY + (touchSY - touchY);
            if(diffY <= 0 || diffY >= topLine){
                return;
            }
            round = Math.round(diffY / 20);
            pointTo.style.transform = 'perspective(1000px) rotateX('+ diffY +'deg)';
            pointTo.style.webkitTransform = 'perspective(1000px) rotateX('+ diffY +'deg)';

            self.draw(pointToList, round);
        })

        container.addEventListener('touchend', function(evt){
            evt.preventDefault();
            var target = evt.target,
                touches = evt.touches[0] || evt.changedTouches[0],
                touchY = touches.clientY,
                round = 0,
                endDiffY = 0;

            diffY = obj.oldY + (touchSY - touchY);
            round = Math.round(diffY / 20);

            /*上界限*/
            if(diffY <= 0){
                endDiffY = 0;
                round = 0;
            }
            /*下界限*/
            else if(diffY >= topLine){
                endDiffY = topLine;
                round = pointToLength - 1;
            }
            else{
                endDiffY = round * 20;
            }
            
            pointTo.style.transition = 'transform .1s ease';
            pointTo.style.webkitTransition = 'transform .1s ease';
            pointTo.style.transform = 'perspective(1000px) rotateX('+ endDiffY +'deg)';
            pointTo.style.webkitTransform = 'perspective(1000px) rotateX('+ endDiffY +'deg)';

            obj.oldY = endDiffY;
            self.draw(pointToList, round);
            if(isYear || isMonth){
                self.getDateList(self.getActive(self.yearDom),self.getActive(self.monthDom));
            }
        })
    }
    /*关闭*/
    HDate.prototype.close = function(){
        var self= this;
        self.main.style.display = 'none';
        self.container.classList.remove('Hbirth-container-show');
    }
    HDate.prototype.closest = function(el, selector){
        if(selector[0] == '.'){
            selector = selector.substring(1);
            while (el) {
                if (el.classList.contains(selector)) {
                    return el;
                } else {
                    el = el.parentElement;
                }
            }
        }
        return null;
    }
    /*得到当前选中的值*/
    HDate.prototype.getActive = function(dom){
        return dom.getElementsByClassName('highlight')[0].getAttribute('data-value');
    }
    HDate.init = function(options){
        return new HDate(options)
    }
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		define(function() {
			return HDate
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = HDate.init()
	} else {
		window.HDate = HDate
	}
}())

