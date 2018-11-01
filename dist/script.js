var pass = '';
var locked = false;
var inited = false; // 初始化
var data = [];
var initdata = {};
var counter = {};
var topic = [0,0,0,0,0,0,0,0,0,0];
// var topic = [1,1,1,1,1,1,1,1,1];
var topic2_count = 0;
var answer_reg1;
var answer_reg2;
var finish_btn = 1;

if(localStorage.getItem("counter") == null){
    counter = { correct: [], wrong: [], answered: [] };
} else {
    counter = JSON.parse(localStorage.getItem("counter")); // 將資料由 JSON 格式字串轉回原本的資料內容及型別。
}
if(localStorage.getItem("init") != null){
    init(localStorage.getItem("init"));
}
for(let i=0;i<topic.length;i++){
    if(topic[i] == 0){
        finish_btn = 0;
    }
}
if(finish_btn == 1){
    $("#upload_btn").show();
}else{
    $("#upload_btn").hide();
}

function update_counter(){ // 刷新答題次數
    localStorage.setItem('counter', JSON.stringify(counter)); // 將資料轉為 JSON 格式的字串。
}

function init(data){
    if(inited == true){
        swal("已經初始化", "", "error");
        return false;
    }

    initdata = JSON.parse(data)[0];
    if(!initdata['upload_data']){
        $('.upload_btn').hide();
    }
    $('[data-table="username"]').text(initdata['username']);
    $('[data-table="contest_title"]').text(initdata['title']);
    $('#info-btn').removeAttr('disabled');

    if(localStorage.getItem("init") == null){
        localStorage.setItem('init', data);
    }
    
    if(!initdata.request_token.enable){
        inited = true;
        pass = initdata['password'];
        swal("初始化完成", "", "success");
    }else{
        $.ajax({
            url: initdata.request_token.url,
            type: 'POST',
            dataType: 'text',
            data: {
                password: initdata['password']
            },
            success: function(val){
                if(val != ''){
                    pass = val
                    inited = true;
                    pass = initdata['password'];
                    swal("初始化完成", "", "success");
                }else{
                    swal('無法取得密碼', '', 'error');
                }
            },
            error: function(){
                swal('無法取得密碼', '', 'error');
            }
        })
    }
}

function parse_question(result){
    locked = true;

    if(result.slice(0, 4) == 'init'){
        init(result.substr(4));
        setTimeout(function(){ locked = false; }, 4000 );
        return true;
    }

    if(!inited){
        swal("尚未初始化", "", "error");
        locked = false;
        return false;
    }

    try{
        data = JSON.parse(CryptoJS.AES.decrypt(result, pass, { mode: CryptoJS.mode['CBC'], padding: CryptoJS.pad['ZeroPadding'] }).toString( CryptoJS.enc.Utf8 ));
    }catch(e){
        swal("無法讀取 QR Code", "該 QR Code 可能不是此遊戲的一部份", "error");
    }

    // if(counter.answered.indexOf(data[0].id) >= 0){
    //     swal("您已經解過此題", "每題只能解一次喔", "error");
    //     locked = false;
    // }else{
        $('[data-name="title"]').text(data[0].title);
        $('[data-name="context"]').html(data[0].context); // 在context裡套用html標籤
        
        $('[data-name2="context"]').html(data[0].context2); // 在context裡套用html標籤
        counter.answered.push(data[0].id);
        update_counter(); // 刷新答題次數
        console.log(data[0]); // 顯示QRcode 資料內容
        $('#question_box').modal('show');
    // }
}

// $('.answer_button').on('click', function(){ // 判斷是否答對題目
//     if($(this).attr('data-name') == data[0].answer){
//         $('#question_box').modal('hide');
//         counter.correct.push(data[0].id);
//         swal("正確", "", "success");
//     }else{
//         $('#question_box').modal('hide');
//         counter.wrong.push(data[0].id);
//         swal("錯誤", "", "error");
//     }
//     update_counter();
//     locked = false;
// });
$('.answer_button').on('click', function(){ // 第一題回答
    $('.answer_button').removeClass('button-clicked');
    answer_reg1 = $(this).attr('data-name');
    $(this).addClass('button-clicked');
});
$('.answer_button2').on('click', function(){ // 第二題回答
    $('.answer_button2').removeClass('button-clicked');
    answer_reg2 = $(this).attr('data-name2');
    $(this).addClass('button-clicked');
});
$('#submit_btn').on('click', function(){ // 判斷是否答對題目
    console.log(data[0].answer+" "+data[0].answer2);
    // console.log(data[0].id);
    if(answer_reg1 == data[0].answer && answer_reg2 == data[0].answer2){
        $('#question_box').modal('hide');
        counter.correct.push(data[0].id);
        console.log(data[0].id);
        if(data[0].id != 2){
            topic[data[0].id] = 1;
        }else{
            console.log("111111");
            if(topic2_count < 1){
                topic2_count++;
            }else{
                topic[data[0].id] = 1;
            }
        }
        
        swal("正確", "", "success");
    }else{
        $('#question_box').modal('hide');
        counter.wrong.push(data[0].id);
        swal("錯誤", "", "error");
    }
    $('.answer_button').removeClass('button-clicked');
    $('.answer_button2').removeClass('button-clicked');
    update_counter();
    locked = false;
});

$('#info-btn').on('click', function(){ // 顯示目前闖關狀態
    if(counter.correct.length>Object.keys(initdata.question).length){
        
    }
    console.log(topic2_count);
    $('[data-table=correct_count]').html('<span class="text-success">' + counter.correct.length + '</span> / '+ Object.keys(initdata.question).length);
    $('[data-table=wrong_count]').html('<span class="text-danger">' + counter.wrong.length + '</span> / '+ Object.keys(initdata.question).length);
    if(topic[0] == 0){
        $('[data-table=topic_0]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_0]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[1] == 0){
        $('[data-table=topic_1]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_1]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[2] == 0){
        $('[data-table=topic_2]').html('<span class="text-danger">未完成 '+topic2_count+'</span> / 2');
    }else{
        $('[data-table=topic_2]').html('<span class="text-success">已完成 2</span> / 2');
    }
    if(topic[3] == 0){
        $('[data-table=topic_3]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_3]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[4] == 0){
        $('[data-table=topic_4]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_4]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[5] == 0){
        $('[data-table=topic_5]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_5]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[6] == 0){
        $('[data-table=topic_6]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_6]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[7] == 0){
        $('[data-table=topic_7]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_7]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[8] == 0){
        $('[data-table=topic_8]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_8]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(topic[9] == 0){
        $('[data-table=topic_9]').html('<span class="text-danger">未完成 0</span> / 1');
    }else{
        $('[data-table=topic_9]').html('<span class="text-success">已完成 1</span> / 1');
    }
    if(navigator.onLine){
        $('#upload_btn').removeAttr('disabled');
    }else{
        $('#upload_btn').attr('disabled', 'disabled');
    }
    $('#contest_data').modal('show');
});

$('#upload_btn').on('click', function(){ // 上傳
    $.ajax({
        url: initdata.upload_data.url, // 網址或.php
        type: 'POST',
        dataType: 'text',
        data: {
            username: initdata['username'],
            data: JSON.stringify(counter)
        },
        success: function(data){
            if(data == 'success'){
                swal('上傳成功', '', 'success');
            }else{
                swal('上傳失敗', '', 'error');
            }
        },
        error: function(data){
            swal('上傳失敗', '', 'error');
        }
    })
});
$('#reset_btn').on('click', function(){ // 重置闖關
    pass = '';
    locked = false;
    inited = false;
    data = [];
    initdata = {};
    localStorage.removeItem('init');
    localStorage.removeItem('counter');
    counter = { correct: [], wrong: [], answered: [] };
    swal('已重置設定', '', 'success');
    $('#contest_data').modal('hide');
    $('#info-btn').attr('disabled', 'disabled');
})

var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function successCallback(stream) {
    if (navigator.mediaDevices) {
        video.srcObject = stream;
    } else {
        if (window.webkitURL) {
            video.src = window.webkitURL.createObjectURL(stream);
        } else if (video.mozSrcObject !== undefined) {
            video.mozSrcObject = stream;
        } else {
            video.src = stream;
        }
    }
}

function loadStream(){

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            devices = devices.filter(function(devices) { return devices.kind === 'videoinput'; });

            var videoinput_id = '';
            devices.forEach(function(device) {
                if(device.label.toLowerCase().search("back") >-1){
                     videoinput_id = device.deviceId;
                }
            });
            if(videoinput_id != ''){
                navigator.mediaDevices.getUserMedia({ video: { deviceId: {'exact':videoinput_id}, facingMode: 'environment' }}).then(successCallback);
            }else{
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }}).then(successCallback);
            }

        });
        
    } else {
        if (getUserMedia) {
            function errorCallback(){}
            navigator.getUserMedia({video: true}, successCallback, errorCallback);
        }
    }
}

video.oncanplay = function() {
    requestAnimationFrame(tick);
};
function tick(){
    requestAnimationFrame(tick);
    var width = parseInt(video.videoWidth);
    var height = parseInt(video.videoHeight);
    canvas.width = width;
    canvas.height = height;

    context.drawImage(video, 0, 0, width, height);
    // Load the image data from the canvas
    var imageData = context.getImageData(0, 0, width, height);
    var decoded = jsQR.decodeQRFromImage(imageData.data, imageData.width, imageData.height);
    if(decoded) {
        if(!locked)
            parse_question(decoded); // 解碼QR Code
    }
}

$('#video').on('click', function(){
    video.play();
});

loadStream();