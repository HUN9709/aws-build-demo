'use strict'

const btnUpload = document.querySelector('.btn-upload');
const inputFile = document.querySelector('input[type="file"]#program-file');
const uploadBox = document.querySelector('#upload-box');

const nonHoverText = document.querySelector('#non-hover-text');
const hoverText = document.querySelector('#hover-text');


// 박스 안에 Drag 들어왔을 때
uploadBox.addEventListener('dragenter', function(e) {
  e.stopPropagation();
  e.preventDefault();
  nonHoverText.classList.add('hidden');  
  hoverText.classList.remove('hidden');
  this.classList.remove('bg-white');
  this.classList.add('bg-blue-200');
  
});

// 박스 안에 Drag 하고 있을 때
uploadBox.addEventListener('dragover', function(e) {
  e.stopPropagation();
  e.preventDefault();
  
});

// 박스 밖으로 Drag가 나갈 때
uploadBox.addEventListener('dragleave', function(e) {
  e.stopPropagation();
  e.preventDefault();
  nonHoverText.classList.remove('hidden');  
  hoverText.classList.add('hidden');
  this.classList.add('bg-white');
  this.classList.remove('bg-blue-200');
  
})

// 박스 안에서 Drag를 Drop 했을 때
uploadBox.addEventListener('drop', function(e) {
  e.stopPropagation();
  e.preventDefault();
  

  nonHoverText.classList.remove('hidden');  
  hoverText.classList.add('hidden');
  this.classList.add('bg-white');
  this.classList.remove('bg-blue-200')


  // console.dir(e.dataTransfer);

  let data = e.dataTransfer.files[0];

  let ext = data.name.slice(data.name.lastIndexOf('.') + 1)// 확장자

  if (ext != 'zip') {
    alert("This file's ext isn't zip");
    return;
  }

  loadFile(e.dataTransfer.files);
});


let fileName;
let fileSize;
let fileSizeStr;
let fileData;

// local 에서 파일 input 되었을 때
function loadFile(files) {
  let file = files[0];

  fileSize = file.size; // 파일 사이즈(단위 : byte)
  let fileSizeKb = fileSize / 1024; // 파일 사이즈(단위 : kb)
  let fileSizeMb = fileSizeKb / 1024;    // 파일 사이즈(단위 : Mb)
  fileSizeStr = "";

  if ((1024 * 1024) <= fileSize) {    // 파일 용량이 1메가 이상인 경우 
    fileSizeStr = fileSizeMb.toFixed(2) + " Mb";
  } else if ((1024) <= fileSize) {
    fileSizeStr = fileSizeKb.toFixed(2) + " KB";
  } else {
    fileSizeStr = parseInt(fileSize) + " bytes";
  }

  fileName = file.name;
  fileData = file;

  setInfo();
};

let noFile = document.getElementById('no-file')
let selectFile = document.getElementById('select-file')
let fileInfo = document.getElementById('file-info');

function setInfo() {
  noFile.classList.add('hidden');
  selectFile.classList.remove('hidden');
  fileInfo.innerText = `${fileName} (${fileSizeStr})`;
}




