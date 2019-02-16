const path = require('path');

function Process(req, res){
    let url = req.url;
    let urlArr = url.split('/');
    if(urlArr[urlArr.length - 1].split('.').length > 1){
        res.sendFile(path.join(global.paths.root, 'www'+url));
    }else{
        res.sendFile(path.join(global.paths.root, 'www/index.html'));
    }
}

module.exports.process = Process;