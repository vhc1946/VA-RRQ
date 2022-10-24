var {ipcRenderer}=require('electron');
var $ = require('jquery');

var RROOT = '../bin/repo/';

var domtools = require('../bin/repo/gui/js/tools/vg-displaytools.js');
var vgtables = require('../bin/repo/gui/js/modules/vg-tables.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-poppers.js');
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var SMView = require('../bin/repo/gui/js/layouts/vg-sidemenuview.js');

var objedit = require('../bin/repo/gui/js/modules/vg-objecteditor.js');
var {settingsroutes}=require('../bin/routes.js');

var adminform=require('../bin/repo/gui/js/forms/vg-adminsettings-form.js');
var userform=require('../bin/repo/gui/js/forms/vg-usersettings-forms.js')
var tierform=require('../bin/gui/forms/rrq-tiersettings-forms.js');

var appsettings=null;

ipcRenderer.send('GET-appsettings','Initial');
ipcRenderer.on('GET-appsettings',(eve,data)=>{
  if(data){
    appsettings = data;
    console.log(appsettings);
    adminform.SETadminsettings(appsettings);
    userform.SETusersettings(appsettings);
    SETquotesettings(appsettings.quotesettings);
  }
});

SMView.SETmenuitems(document.getElementById('settings-cont'));
SMView.SETmenuitems(document.getElementById('quote-settings')); //sub menu

//  ADMIN  //
document.getElementById(adminform.admdom.cont).addEventListener('change',(ele)=>{
  appsetings=objedit.GETedit(document.getElementById(adminform.admdom.cont));
  console.log(appsettings);
});
/////////////////////////////

// USER  //
document.getElementById(userform.usedom.cont).addEventListener('change',(ele)=>{
  userform.GETusersettings();
});
/////////////////////////////

//  QUOTE //////////////////////////////////////////////////////////////////////
var quodom={
  cont:'quote-settings',
  finance:'finance-list',
  roadmap:'roadmap-list',
  tiers:{
    list:'tier-list',
    form:{
      cont:'tier-form-cont',
      info:{
        code:'tier-form-code',
        name:'tier-form-name',
        color:'tier-form-color'
      },
      featgroup:{
        list:'tier-form-featgroups'
      }
    }
  }
}

var SETquotesettings=(settings)=>{
  if(settings&&settings!=undefined){
    vgtables.BUILDintable(settings.finance,document.getElementById(quodom.finance));
    vgtables.BUILDintable(settings.roadmap,document.getElementById(quodom.roadmap));
    tierform.SETtierlist(settings.tiers,document.getElementById(quodom.tiers.list));
  }
}

//  PRICE KEY //
document.getElementById("admin-create-pricekey").addEventListener('click',(ele)=>{
  ipcRenderer.send(settingsroutes.createkey,'Settings');
});
ipcRenderer.on(settingsroutes.createkey,(eve,data)=>{
  if(data.key){
    DropNote('tr',data.msg,'green');
    console.log(data.key);
  }else{DropNote('tr',data.msg,'yellow')}
});

//  FINANCE  //
document.getElementById(quodom.finance).addEventListener('change',(ele)=>{
  appsettings.quotesettings.finance = vgtables.READintable(document.getElementById(quodom.finance).children);
  console.log(appsettings);
});
/////////////////////////

//  ROAD MAP  //
document.getElementById(quodom.roadmap).addEventListener('change',(ele)=>{
  appsettings.quotesettings.roadmap = vgtables.READintable(document.getElementById(quodom.roadmap).children);
  console.log(appsettings);
});
/////////////////////////

//  TIER  //
document.getElementById(tierform.tiedom.actions.save).addEventListener('click',(ele)=>{
  let tobj = tierform.GETtieredit();
  if(tobj.code!=''){
    let found = false;
    for(let x=1;x<appsettings.quotesettings.tiers.length;x++){
      if(appsettings.quotesettings.tiers[x].code == tobj.code){
        appsettings.quotesettings.tiers[x] = tobj;
        found=true;
        break;
      }
    }
    if(!found){
      appsettings.quotesettings.tiers.push(tobj);
    }
  }

  tierform.SETtierlist(appsettings.quotesettings.tiers,document.getElementById(quodom.tiers.list));
  console.log('add ',appsettings);
});
document.getElementById(tierform.tiedom.actions.delete).addEventListener('click',(ele)=>{
  let tobj = tierform.GETtieredit();
  for(let x=1;x<appsettings.quotesettings.tiers.length;x++){
      if(appsettings.quotesettings.tiers[x].code == tobj.code){
        appsettings.quotesettings.tiers.splice(x,x);
        SETtierlist(appsettings.quotesettings.tiers);
        break;
      }
  }
  console.log('delete ',appsettings);
});
/////////////////////////

////////////////////////////////////////////////////////////////////////////////


var SAVEsettings=()=>{
  ipcRenderer.send(settingsroutes.save,appsettings);
}
ipcRenderer.on(settingsroutes.save,(eve,data)=>{
  console.log(data.msg, '-', data.data);
});

document.getElementById(Titlebar.tbdom.page.save).addEventListener('click',(ele)=>{
  SAVEsettings();
})
