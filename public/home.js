const socket = io();

function onReceiveVoiceData(data) {
    console.log(data)

    var audio = new Audio(data.data);
    audio.play();
}

const voiceChat = new VoiceChat(socket, 500, this.onReceiveVoiceData);

socket.on("connect", () => {
    console.log('c');
})

function startVoiceChat() {
    voiceChat.start((err) => {
        if(err) {
            return console.log("err")
        } 

        console.log("ok")
        alert("started")
    });
}

function VoiceChat(socket, recordTime, callbackOnReceiveVoiceData) {
    this.recordTime = recordTime;
    this.audioChunks = [];
    this.socket = socket;

    socket.on("voiceData", (data) => {
        callbackOnReceiveVoiceData(data);
    })
} 

VoiceChat.prototype.start = function(callback) {
    const time = this.recordTime;
    const self = this;

    navigator.mediaDevices.getUserMedia({ audio: true }).catch(e => {
        console.log("not allowed")
    }).then((stream) => {

        if(!stream) {
            callback(true);
            return
        }
        

        var mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.addEventListener("stop", function () {
            console.log("Recorded chunk...")

            self.sendVoiceData();

            mediaRecorder.start();

            setTimeout(() => mediaRecorder.stop(), time);
        });


        mediaRecorder.addEventListener("dataavailable", function (event) {
            self.audioChunks.push(event.data);
        });

        setTimeout(() => mediaRecorder.stop(), time);

        callback(false);
    });
}

VoiceChat.prototype.sendVoiceData = function() {
    const self = this;
    const audioChunks = this.audioChunks;

    var audioBlob = new Blob(audioChunks);
    var fileReader = new FileReader();
    fileReader.readAsDataURL(audioBlob);
    fileReader.onloadend = function () {
        var base64String = fileReader.result;
        self.socket.emit("voiceData", base64String);

        console.log("sent")
    };
    

    this.audioChunks = [];
}