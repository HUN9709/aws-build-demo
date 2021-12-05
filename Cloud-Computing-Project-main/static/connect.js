'use strict'

let socket = io.connect('http://' + document.domain + ':' + location.port)

console.log(socket)
let upload_per;
$('#submit').on('click', function(e) {
    e.preventDefault();

    let version = $( 'input#version' ).val()
    let author = $( 'input#author' ).val()
    let file_path = $('input#file-path').val()
    let display_name = $('input#display-name').val()

    let message = 'field is empty'
    // if (author.trim().length == 0) {
    //     message += '(author)'
    //     alert(message);
    // } else if(file_path.trim().length == 0) {
    //     message += '(exe file path)'
    //     alert(message);
    // } else if(display_name.trim().length == 0) {
    //     message += '(display name)'
    //     alert(message);
    // }


    const request = new XMLHttpRequest();
    let send_data = { 'author' : author};
    send_data['version'] = version;    
    send_data['author'] = author;    
    send_data['file_path'] = file_path;    
    send_data['display_name'] = display_name;
    
    let reader = new FileReader();
    let raw_data = new ArrayBuffer();

    reader.loadend = function () {

    }
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    
    reader.onload = async function (e) {
        let raw_data = e.target.result;
        let prev = 0
        for (let i = 65000; i < raw_data.byteLength; i+= 65000){
            socket.send(raw_data.slice(prev, i));
            await sleep(300)
            upload_per = (((i) / raw_data.byteLength) * 100)
            prev = i;
        }
        socket.send(raw_data.slice(prev));
        socket.emit('build')
    }
    
    
    socket.emit('pre-upload', send_data);
    
    socket.on('upload', function () {
        reader.readAsArrayBuffer(fileData);
    })
});

socket.on('download', function (data) {
    
    
    window.location.href('http://' + document.domain + ':' + location.port + '/download/' + data['file_uuid'] + '/' + data['display_name'])
})


socket.on('message', function(data) {
    console.log(data)
})