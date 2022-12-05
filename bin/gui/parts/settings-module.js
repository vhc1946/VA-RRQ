var {ipcRenderer}=require('electron');
var {settingsroutes}=require('../bin/routes.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');
///Admin Close Button
document.getElementById('close-admin').addEventListener('click',(ele)=>{
  $(document.getElementById('vg-center-info-admin')).hide();
});

document.getElementById('update-key').addEventListener('click',(ele)=>{
  ipcRenderer.send(settingsroutes.createkey,'Request new key..')
});


ipcRenderer.on(settingsroutes.createkey,(err,data)=>{
  if(data.key){
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red')}
});
