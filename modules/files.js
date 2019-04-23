const fs = require('fs');
const path = require('path');

function initializeDirectory(path){
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
}

function initializeLocalFile(file) {
    return new Promise((res, rej) => {
        if (!fs.existsSync(file)) {
        console.log(file);
        fs.writeFile(file, '', 'utf8', (err) => {
            if (err) {
                rej(err);
            } else {
                res(true);
            }
        });
        }else{
            res(true);
        }
    });
}

function localStore (obj) {
    return new Promise((res)=>{
        let fullFile = path.join(global.paths.storage, obj.file);
        initializeLocalFile(fullFile).then(() => {
            fs.readFile(fullFile, 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                }
                if (!data) {
                    let array = []
                    array.push(obj.data);
                    if(obj.json){
                        json = JSON.stringify(obj.data);
                    }else{
                        json = JSON.stringify(array);
                    }
                    fs.writeFile(fullFile, json, 'utf8', () => {
                        if(obj.json){
                            res(obj.data);
                        }else{
                            res(array);
                        }
                    });
                } else {
                    let file = JSON.parse(data); //get full db file
                    let fLen = Object.keys(file).length;
                    file[fLen] = obj.data;
                    if(obj.json){
                        json = JSON.stringify(obj.data);
                    }else{
                        json = JSON.stringify(file);
                    }
                    fs.writeFile(fullFile, json, 'utf8', () => {
                        if(obj.json){
                            res(obj.data);
                        }else{
                            res(file);
                        }
                    });
                }
            });
        });
    })
}
  
function localGet (obj) {
    return new Promise((res)=>{
        let fullFile = path.join(global.paths.storage, obj.file);
        initializeLocalFile(fullFile).then(() => {
            fs.readFile(fullFile, 'utf8', (err, data) => {
                if (err || !data) {
                    res(err);
                    //e.sender.send('local-get-reply', err);
                } else {
                    let reply = JSON.parse(data);
                    res(reply)
                    //e.sender.send('local-get-reply', reply);
                }
            });
        });
    })
}

module.exports.initializeDirectory = initializeDirectory;
module.exports.localStore = localStore;
module.exports.localGet = localGet;