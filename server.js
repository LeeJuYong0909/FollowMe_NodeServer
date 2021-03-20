const express = require('express'); // exrpess 웹 프레임워크 모듈 선언
const app = express();  // express 프레임워크 사용
const server = require('http').Server(app); // express를 사용한 Http 서버 구축
const bodyParser = require('body-parser'); // post값 받게하는 모듈 선언
const io = require('socket.io')(server,{ //소켓 io 로 서버 구축
    // Cross Origin Resource Sharing
    cors:"*" // 접속하려는 도메인이 서버의 도메인과 달라도 접속을 허용함
});
const checkInterval = 1000; // 1초
const signalTimeOut = 10; // 10초, 이상유무 판단 시간
const checkTime = Math.ceil((+ new Date()/1000) + signalTimeOut);
;
var beaconCheckList=[]; // 비콘 신호 체크 리스트

console.log('Node server on')
// const port = process.env.PORT || 5500 ;

//소켓 io를 처리할 객체 생성
io.on('connect', socket => {
    console.log("연결된 socketID : ", socket.id);

    
    socket.on('pingServer', (data) => {
		console.log("pingServer!!")
	});
    
})

//json 형식으로 http 통신하기
app.use(bodyParser.json())

// POST값 받기
app.post('/',function(req,res){
    var msg=req.body.beaconData;// 받은 데이터 msg 변수에 저장

    // 받은데이터 콘솔에 출력
    console.log("{ 'scannerID': '" + msg["scannerID"] + "', 'UUID': '" + msg["UUID"] + "', 'Major': " + msg["Major"] + ", 'Minor': " + msg["Minor"] + ", 'RSSI': " + msg["RSSI"] +  "'Distance' : "+msg["Distance"] + "} ");

    // 비콘 체크 리스트에 현 비콘 추가
    beaconCheckList[msg["Minor"]] = Math.floor(+ new Date()/1000);

    msg['Error'] = "正常";
    io.emit('beaconInfo', msg)
    return res.json({success:true});
});

// 비콘 신호 에러처리
setInterval(() => {
    var currentTime = Math.ceil(+ new Date()/1000);
    if(checkTime < currentTime){
        beaconCheckList.forEach(function(element , index) {
            if(element < currentTime - signalTimeOut){
                var errorBeacon = {
                    "Minor"    : index,
                    "LastReceivedTime" : element,
                    "Error" : "異常"
                }
                console.log(errorBeacon)
                io.emit('beaconError', errorBeacon)
            }
    
        })
    }
}, checkInterval);

// url:3000 으로 소켓 서버 구축
server.listen(3000)
