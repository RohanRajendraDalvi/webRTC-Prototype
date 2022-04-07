const socket = io('/');
const videoGrid = document.getElementById('video-grid');
let recording = document.getElementById('record');
let RecFlag = false;
let disptext = document.getElementById('user-info');
let msg = document.getElementById('message');
let yourName = document.getElementById('name');
let chat = "";
let questionButtons = document.getElementById('questionButtons');
let userQuestion = document.getElementById('question');
let recQ = document.getElementById('currentQuestion');
let recA = document.getElementById('currentAnswer');
let AddQT = document.getElementById('addQuestionTitle');
let AddQ = document.getElementById('addQuestion');
let AddQA = document.getElementById('addQuestionAnswer');
let answer=document.getElementById('answer');
let QnApanel= document.getElementById('QnA')
QnApanel.style.display="none";0
let Qpanel= document.getElementById('controlPanel');
Qpanel.style.display="none";
let innitPanel=document.getElementById('user-innit');
let currentQ = 1;
let recbtn=document.getElementById('recruit');
recbtn.style.visibility="";
let intbtn=document.getElementById('interviewer');
intbtn.style.visibility="";
let recStatus=false;
let myUserId;

function recbtnvis(){
  if (recStatus==true){
    console.log(recbtn);
    recbtn.style.visibility="hidden";
  }
}

let questions = [{
  Qno: 1,
  Title: "Planets",
  Question: "How many planets in the solar system?",
  Answer: "8",
  userAns: ""
},
{
  Qno: 2,
  Title: "Toes",
  Question: "How many toes do humans have?",
  Answer: "10",
  userAns: ""
},
{
  Qno: 3,
  Title: "Lions",
  Question: "How do lions hunt their prey",
  Answer: "They chase the prey and then kill it.",
  userAns: ""
}
]
let html3 = `Q${questions[currentQ-1].Qno}. ${questions[currentQ-1].Title} \nQuestion: ${questions[currentQ-1].Question}`;
console.log(currentQ)
userQuestion.innerText = html3;
recQ.innerText = html3;
recA.innerHTML ='Expected Answer'+ questions[currentQ-1].Answer;
firstorlast();

let html2 = '';
for (let i = 0; i < questions.length; i++) {
  html2 += `<button class="btn btn-primary m-1" id="Qno${questions[i].Qno}" onclick="displayQuestion(${questions[i].Qno})">${questions[i].Title}</button>`;
}
questionButtons.innerHTML = html2;


const myPeer = new Peer(undefined, {
 debug:'2'
})

function firstorlast(){
  if(currentQ==1){
    userButtons.innerHTML=`<button class="btn btn-primary" id="saveAns" onclick="saveAns()">Submit?</button>
    <button class="btn btn-primary" id="next" onclick="next()">Next Question</button>
    <button class="btn btn-primary align-self-lg-end" id="endTest" onclick="endTest()">End Test</button>`;
    adminButtons.innerHTML=`<button class="btn btn-primary m-1" id="nextbtn" onclick="next()">Change to Next Question</button>
    <button class="btn btn-primary align-self-lg-end"  onclick="endTest()">End the Interview?</button>`
   }else if(currentQ==questions.length){
     userButtons.innerHTML=`<button class="btn btn-primary" id="priv" onclick="priv()">Previous Question</button>
     <button class="btn btn-primary" id="saveAns" onclick="saveAns()">Submit?</button>
     <button class="btn btn-primary align-self-lg-end" id="endTest" onclick="endTest()">End Test</button>`
     adminButtons.innerHTML=`<button class="btn btn-primary m-1" id="privbtn" onclick="priv()">Change to Previous Question</button>
     <button class="btn btn-primary align-self-lg-end"  onclick="endTest()">End the Interview?</button>`
   } else {
     userButtons.innerHTML=`<button class="btn btn-primary" id="priv" onclick="priv()">Previous Question</button>
     <button class="btn btn-primary" id="saveAns" onclick="saveAns()">Submit?</button>
     <button class="btn btn-primary" id="next" onclick="next()">Next Question</button>
     <button class="btn btn-primary align-self-lg-end" id="endTest" onclick="endTest()">End Test</button>`
     adminButtons.innerHTML=`<button class="btn btn-primary m-1" id="privbtn" onclick="priv()">Change to Previous Question</button>
         
     <button class="btn btn-primary m-1" id="nextbtn" onclick="next()">Change to Next Question</button>
     <button class="btn btn-primary align-self-lg-end"  onclick="endTest()">End the Interview?</button>`
   }
}

let displaytext = '';
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myVideoStream;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myVideoStream.getAudioTracks()[0].enabled = false;

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log(userId);
    connectToNewUser(userId, stream);

  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  myUserId=id;
  socket.emit('join-room', ROOM_ID, id)
})



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream;

  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGrid.append(video);
}



function sendmessage() {
  if (msg.value.length !== 0) {
    console.log(msg.value)
    content = {
      message: msg.value,
      Name: yourName.value
    }
    console.log(content.Name);
    socket.emit('message', content);
    msg.value = '';
  }

}

socket.on('createMessage', content => {
  const d = new Date();

  chat += `<div>${content.Name} <h5> ${content.message}</h5>  <p>${d.toString()}</p></div>`;
  disptext.innerHTML = chat;
  chat += '<br>';
  console.log(content.message)
})




let mediaRecorder;

recording.addEventListener('click', function () {
  if (RecFlag == false) {
    RecFlag = true;
    recording.innerText = 'Stop recording'
    start();
  }
  else {
    RecFlag = false;
    recording.innerText = 'Record'
    stop();
  }
})

async function start() {
  let stream = await recordScreen();
  let mimeType = 'video/webm';
  mediaRecorder = createRecorder(stream, mimeType);

}

function stop() {
  mediaRecorder.stop();

}
async function recordScreen() {
  return await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: { mediaSource: "screen" }
  });
}

function createRecorder(stream, mimeType) {
  // the stream data is stored in this array
  let recordedChunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = function () {
    saveFile(recordedChunks);
    recordedChunks = [];
  };
  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(recordedChunks) {
  recording.innerText = 'Record';
  const blob = new Blob(recordedChunks, {
    type: 'video/webm'
  });
  let filename = window.prompt('Enter file name'),
    downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filename}.webm`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blob); // clear from memory
  document.body.removeChild(downloadLink);

}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    document.getElementById("mute-unmute").innerText = "Unmute";
  } else {
    document.getElementById("mute-unmute").innerText = "Mute";
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    document.getElementById("playStop").innerText = 'Start-Video';
  }
  else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    document.getElementById("playStop").innerText = 'Stop-Video';
  }
}

function displayQuestion(Qno) {
  socket.emit('dispQ', Qno);
}

socket.on('displayedQ', Qno => {
  let obj = questions.find(data => data.Qno === Qno);
  html3 = `Q${obj.Qno}. ${obj.Title} \nQuestion: ${obj.Question}`;
  currentQ = Qno;
  userQuestion.innerText = html3;
  recQ.innerText = html3;
  recA.innerHTML ='Expected Answer: '+ obj.Answer;
  document.getElementById('submittedAns').innerText='Submitted Ans: '+questions[currentQ-1].userAns;
  document.getElementById('userSubmittedAns').innerText='Submitted Ans: '+questions[currentQ-1].userAns;
  firstorlast();
  


})

function priv() {
  if (currentQ!=1){
  displayQuestion(currentQ - 1)}
}
function next() {
  if (currentQ!=questions.length){
  displayQuestion(currentQ + 1)}
}
function saveAns(){
  if(answer.value.length!=0){
    socket.emit('answerSubmitted',answer.value)
    
  }
}
socket.on('submittedAns',ans=>{
  questions[currentQ-1].userAns=ans;
  console.log(questions)
  document.getElementById('submittedAns').innerText='Submitted Ans: '+questions[currentQ-1].userAns;
  document.getElementById('userSubmittedAns').innerText='Submitted Ans: '+questions[currentQ-1].userAns;
  answer.value='';
})


function addQ() {
  if (AddQ.value.length !== 0 || AddQT.value.length !== 0) {
    let newQ = {
      Qno: questions.length + 1,
      Title: AddQT.value,
      Question: AddQ.value,
      Answer: AddQA.value,
      userAns: ""
    }

    socket.emit('addNewQ', newQ);
    AddQ.value = '';
    AddQA.value = '';
    AddQT.value = '';

  }
}

socket.on('newQ', newQ => {
  questions.push(newQ);

  let html4 = '';
  for (let i = 0; i < questions.length; i++) {
    html4 += `<button class="btn btn-primary m-1" id="Qno${questions[i].Qno}" onclick="displayQuestion(${questions[i].Qno})">${questions[i].Title}</button>`;
  }
  questionButtons.innerHTML = html4;
  firstorlast();

})

function endTest(){
  socket.emit('testEnd',questions);


}

socket.on('endedTest', x => {
  
  let endtext=`<h2>The interview has ended:</h2>
  <h4>Results:</h4>`;
  for(let j=0;j<x.length;j++){
    endtext+=`<div class="my-2"><h5>Q.${j+1} Question Title: ${x[j].Title}</h5>
    <h6>Question: ${x[j].Question}</h6>
    <p>Expected Answer: ${x[j].Answer}</p>
    <h6>Submitted Answer: ${x[j].userAns}</h6></div>`  }
    document.getElementById('QnA').innerHTML=endtext;
    document.getElementById('controlPanel').innerHTML=endtext;

})
 function checkRec(){
socket.emit('check-recruit',recStatus);
console.log(recStatus);
console.log("hii")
return 'hii';
}

socket.on('rec-status',recJoined=>{
  console.log(recJoined);
  recStatus=recJoined;
  recbtnvis();

})
checkRec();
function interviewerjoined(){
  innitPanel.style.visibility="hidden";
  Qpanel.style.display="block";
  QnApanel.style.display="none";
 
}
function recruitjoined(){
  innitPanel.style.visibility="hidden";
  QnApanel.style.display="block";
  Qpanel.style.display="none";
}