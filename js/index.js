let loadingRender = (function(){
    let $loadingBox = $('.loadingBox'),
        $current = $loadingBox.find('.current');
    let imgData = ["img/icon.png", "img/zf_concatAddress.png", "img/zf_concatInfo.png", "img/zf_concatPhone.png", "img/zf_course.png", "img/zf_course1.png", "img/zf_course2.png", "img/zf_course3.png", "img/zf_course4.png", "img/zf_course5.png", "img/zf_course6.png", "img/zf_cube1.jpg", "img/zf_cube2.jpg", "img/zf_cube3.jpg", "img/zf_cube4.jpg", "img/zf_cube5.jpg", "img/zf_cube6.jpg", "img/zf_cubeBg.jpg", "img/zf_cubeTip.png", "img/zf_messageArrow1.png", "img/zf_messageArrow2.png", "img/zf_messageChat.png", "img/zf_messageKeyboard.png", "img/zf_messageLogo.png", "img/zf_messageStudent.png", "img/zf_outline.png", "img/zf_phoneBg.jpg", "img/zf_phoneDetail.png", "img/zf_phoneListen.png", "img/zf_phoneLogo.png", "img/zf_return.png"];

    // run : 预加载图片
    let n = 0,
        len = imgData.length;
    let run = function run(callback){
        imgData.forEach(item => {
            let tempImg = new Image();
            tempImg.onload = () => {
                tempImg = null;
                $current.css('width',++n / len * 100 + '%');
                //=>加载完成:执行回调函数(让当前loading页面消失)
                if(n === len){
//                    clearTimeout(maxDelay);
                   callback && callback();
         
                }
            }
            tempImg.src = item;
        });
    }

    /*  maxdelay : 设置最长等待时间(假设10s,到达10s我们看加载多少了,如果已经达到了90%以上,
    我们可以正常访问内容,如果不足这个比例,直接提示用户当前用户网络状态不接,稍后重试) */
//     let delayTimer = null;
//     let maxDelay = function maxDelay(callback){
//         delayTimer = setTimeout(() => {
//             if(n / len >= 0.9){
//                 callback && callback();
//                 return;
//             }
//             alert('非常遗憾,当前您的网络状况不佳,请稍后在试!');
//         //这里超过10s,让它关闭当前页面
//         $loadingBox.remove();
//         },10000);
//     }

    // done : 完成
    let done = function done(){
        let timer = setTimeout(()=>{
            $loadingBox.remove();
            clearTimeout(timer);
            phoneRender.init();
        },4000);
    }

    return {
        init : function(){
            $loadingBox.css('display','block');
            run(done);
//             maxDelay(done);
        }
    }
})();

/* phone */
let phoneRender = (function(){
    let $phoneBox = $('.phoneBox'),
        $time = $phoneBox.find('span'),
        $answer = $phoneBox.find('.answer'),
        $answerMarkLink = $answer.find('.markLink'),
        $hang = $phoneBox.find('.hang'),
        $hangMarkLink = $hang.find('.markLink'),
        answerBell = $('#answerBell')[0],
        introduction = $('#introduction')[0];

    //=>点击answer-mark
    let answerMarkTouch = function answerMarkTouch(){
        //1.点击remove answer
        $answer.remove();
        //一定要先暂停播放,在移除!否则即使移除了,没暂停,浏览器原因还是会播放的
        answerBell.pause();
        $(answerBell).remove();

        //2.show hang
        $hang.css('transform','translateY(0rem)');
        $time.css('display','block');
        introduction.play();
        computedTime();
    }

    //=>计算播放时间
    let computedTimer = null;
    let computedTime = function computedTime(){
        computedTimer = setInterval(function(){
            let val = introduction.currentTime;
            //播放完成
            if(introduction.duration <= val){
                clearInterval(computedTimer);
                closePhone();
                return;
            }
            let minute = Math.round(val / 60),  //总秒数除以60 = 分钟 向下取整
                second = Math.floor(val - minute * 60); //总秒数减去计算出来分钟乘60 向下取整得出来是秒数
            minute = minute >= 10 ? minute : '0' + minute;
            second = second >= 10 ? second : '0' + second;

            $time.html(`${minute}:${second}`);
    },1000);
    }

    //关闭phone
    let closePhone = function closePhone(){
        clearInterval(computedTimer);
        $phoneBox.remove();
        introduction.pause();
        $(introduction).remove();
        messageRender.init();
    }

    return {
        init : function(){
            $phoneBox.css('display','block');
            //=>播放bell
            answerBell.play();
            answerBell.volume = 0.3;
            //点击answerMark
            $answerMarkLink.on('touchstart',answerMarkTouch);
            $hangMarkLink.on('touchstart',closePhone);
        }
    }
})();

/* message */
let messageRender = (function(){
    let $messageBox = $('.messageBox'),
        $warpper = $messageBox.find('.wrapper'),
        $messageList = $warpper.find('li'),
        $keyBoard = $messageBox.find('.keyBoard'),
        $textInp = $keyBoard.find('span'),
        $submit = $keyBoard.find('.submit'),
        $demon = $messageBox.find('#demon');

    let step = -1, // 记录当前展示信息的索引
        total = $messageList.length + 1, //记录的是信息总条款(自己发一条所以加1)
        autoTimer = null,
        interval = 2000; //记录信息相继出现的间隔时间


    /* 展示信息 */
    let wrapT = 0;
    let showMessage = function showMessage(){
        ++step;
        if(step === 2){ // 已经展示两条了,此时我们展示结束自动信息发送,让键盘出来
            clearInterval(autoTimer);
            handleSend();
            return;
        }
        let $cur = $messageList.eq(step); //获取当前索引的jq对象
        $cur.addClass('active');
        if(step >= 3){
            if(step >= $messageList.length){
            clearInterval(autoTimer);
            closeMessage();
            return;
            }
            // 展示的条数已经是四条或者四条以上了,此时我们让wrapper向上移动(移动距离是新展示这一条的高度)
            let curH = $cur[0].offsetHeight + 110;
                wrapT -= curH;
            $warpper.css('top',wrapT / 100 + 'rem');
        }
    }

    /* 手动发送 */
    let handleSend = function handleSend(){
        $keyBoard.css('transform','translateY(0rem)')
        // transitionend : 监听当前元素transition动画结束的事件(有几个样式属性改变并且执行了过渡效果,事件就会触发几次)
            .one('transitionend',() => {  //如果这里用on 隐藏键盘是后transtion又会执行一次,transitionend又会执行一次里面内容
            let str = '好的,马上介绍~~~~',
                textStep = 0,
                textTimer = null;
                textTimer = setInterval(() => {
                    if(textStep >= str.length - 1){
                        clearInterval(textTimer);
                        $submit.css('display','block');
                    }
                    $textInp[0].innerHTML += str[textStep];
                    textStep++;
                },500);
        });
    }

    /* 点击submit */
    let handleSubmit = function handleSubmit(){
        /* 把新创建的li追加到页面中第二个li后面 */
        $(`<li class = 'self'>
            <i class = "arrow"></i>
            <img src = "img/zf_messageStudent.png" alt = "" class = 'pic'>
            ${$textInp.html()}
        </li>`).insertAfter($messageList.eq(1)).addClass('active');

        /* 该消失的消失 */
        $textInp.html('');
        $submit.css('display','none');
        $keyBoard.css('transform','translateY(3.7rem)');
        $messageList = $warpper.find('li');   //=>把新的li放到页面中,我们此时应该重新获取li
        autoTimer = setInterval(showMessage,interval);
    }

    /* 关闭当前页面 */
    let closeMessage = function closeMessage(){
        setTimeout(function(){
            $demon[0].pause();
            $demon.remove();
            $messageBox.remove();
            cubeRender.init();
        },1500);
    }

    return {
        init: function(){
            $messageBox.css('display','block');
            //加载模板立即展示一条信息,后期间隔interval在发送一条信息
            showMessage();
            $demon[0].play();
            autoTimer = setInterval(showMessage,interval);

            /* 点击submit */
            $submit.tap(handleSubmit);
        }
    }
})();

/*cube*/
let cubeRender = (function(){
    let $cubeBox = $('.cubeBox'),
        $messageBox = $('.messageBox'),
        $cube = $('.cube'),
        $cubeList = $cube.find('li');

    //手指控制旋转
    let start = function start(ev){
        //=> 记录手指按在位置的起始坐标
        let point = ev.changedTouches[0];
        this.strX = point.clientX;
        this.strY = point.clientY;
        this.changeX = 0;
        this.changeY = 0;
    }
    let move = function move(ev){
        //=> 用最新手指的位置 减去 起始的位置,记录X、Y轴的偏移
        let point = ev.changedTouches[0];
        this.changeX = point.clientX - this.strX;
        this.changeY = point.clientY - this.strY;
    }
    let end = function end(){
        //=> 获取change / rotate 值
        let {changeX,changeY,rotateX,rotateY} = this,
            isMove = false;
        Math.abs(changeX) > 10 || Math.abs(changeY) > 10 ? isMove = true : null;
        //=> 只有发生移动再处理
        if(isMove){
            //1.左右滑 => change - X => rotate - Y(正比:change越大rotate越小)
            //2.上下滑 => change - Y => rotate - X（反比:change越大rotate越小）
            rotateX = rotateX - changeY;
            rotateY = rotateY + changeX;
            //=> 赋值给魔法盒子
            $(this).css('transform',`scale(0.6) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
            //=> 让当前旋转的角度称为下一次起始的角度
            this.rotateX = rotateX;
            this.rotateY = rotateY;
        }
    }

    return {
        init : function(){
            $messageBox.css('display','none');
            $cubeBox.css('display','block');

            /* 手指操作cube,让cube跟着旋转 */
            let cube = $cube[0];
                cube.rotateX = -35;
                cube.rotateY = 35; //=> 记录初始的旋转角度(存储到自定义属性上)
            $cube.on('touchstart',start)
                .on('touchmove',move)
                .on('touchend',end);

            //-> 点击每一个面跳转到详情区域对应的页面
            $cubeList.tap(function(){
                $cubeBox.css('display','none');
                //=> 跳转到详情区域,通过传递点击li索引,让其定位具体的slide
                let index = $(this).index();
                detailRender.init(index);
            });
        }
    }
})();

/* detail; */
let detailRender = (function(){
    let $detailBox = $('.detailBox'),
        $messageBox = $('.messageBox'),
        swiper = null,
        $dl = $('.page1 > dl');

    let swiperInit = function swiperInit(){
        swiper = new Swiper ('.swiper-container',{
            //loop: true, //=> 3d切换设置loop设置loop为true的时候偶尔会出现无法切换情况(2d效果没问题)
            effect: "coverflow",
            onInit: move,
            onTransitionEnd: move
        })
    }

    let move = function move(swiper){
            // 1.判断当前是否为第一个slide:如果是让3d菜单展开,不是收起3D菜单
            let activeIn = swiper.activeIndex,
                slideAry = swiper.slides;
            if(activeIn === 0) {
                $dl.makisu({
                    selector: 'dd',
                    overlap: 0.6,
                    speed: 0.8
                });
                $dl.makisu('open');
            }else{
                $dl.makisu({
                    selector: 'dd',
                    speed: 0
                });
                $dl.makisu('close');
            }

            //2.滑动到哪一个页面,把当前页面设置对应的ID,其余页面移除ID即可
            slideAry.forEach((item,index) => {
                if(activeIn === index){
                    item.id = `page${index+1}`;
                    return;
                }else{
                    item.id = '';
                }
                item = null;
            });
    }

    return {
        init: function(index){
            $detailBox.css('display','block');
            $messageBox.css('display','none');
            if(!swiper){
                //-> 防止重复初始化
                swiperInit();
            }
            swiper.slideTo(index,0);//-> 直接运动到具体的slide页面(第二个参数是切换的速度：0立即切换没有切换的动画效果)
        }
    }
})();

/* 开发过程中,由于当前项目板块众多(每一个板块都是一个单例),我们最好规划一种机制:
通过标识的判断可以让程序只执行对应板块内容,这样开发哪个板块,我们就把标识改为啥(hash路由控制) */
let url = window.location.href, //=>获取当前页面的url地址
    well = url.indexOf('#'),
    hash = well === -1 ? null : url.substring(well+1);
switch(hash){
    case 'loading':
        loadingRender.init();
        break;
    case 'phone':
        phoneRender.init();
        break;
    case 'message':
        messageRender.init();
        break;
    case 'cube':
        cubeRender.init();
        break;
    case 'detail':
        detailRender.init();
        break;
    default:
        loadingRender.init();
        break;
}
