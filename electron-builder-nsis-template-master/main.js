const {app, BrowserWindow} = require('electron');
const path = require('path');
var exec = require('child_process').execFile;

var executeBuild = function(){
    exec('./main/main.exe', function(err, data){
        console.log(err);
        console.log(data.toString())
    });
};

executeBuild(1);