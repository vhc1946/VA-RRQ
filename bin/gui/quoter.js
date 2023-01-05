const $=require('jquery');
var {ipcRenderer}=require('electron');

var RROOT='../bin/repo/';
var Titlebar=require('../bin/repo/gui/js/modules/vg-titlebar.js');
var floatv = require('../bin/repo/gui/js/modules/vg-floatviews.js');

//layouts
var {stdbook}=require('../bin/repo/gui/js/layouts/vg-stdbook.js');
var vcontrol = require('../bin/repo/gui/js/layouts/view-controller.js');
var gentable=require('../bin/repo/gui/js/modules/vg-tables.js');
var domtools=require('../bin/repo/gui/js/tools/vg-displaytools.js');

//tools
var {ObjList}=require('../bin/repo/tools/box/vg-lists.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');

//useful paths
var {quotesls}=require('../bin/gui/storage/lstore.js');
var {quoteroutes,navroutes}=require('../bin/routes.js');

var pricer = require('../bin/pricekey/rrq-pricer.js');
var blddom={ //build dom
  cont:'vg-stdbook-pages',
  nav:{
    sidebar: "vg-stdbook-cont-sidenav",
    sidebuttons: "vg-stdbook-cont-sidenav-button",
    sidebuttonsele: "vg-stdbook-cont-sidenav-button-selected",
    right: "vg-stdbook-cont-sidenav-right",
    left: "vg-stdbook-cont-sidenav-left",
    viewbuttons:{
      info:'rrq-info-button',
      systems:'rrq-systems-button',
      accessories:'rrq-accessories-button',
      summary:'rrq-summary-button'
    }
  },
  pages:{
    cont:'vg-stdbook-pages',
    views:{
      info:'rrq-build-info',
      systems:'rrq-build-systems',
      accessories:'rrq-build-accessories',
      summary:'rrq-build-summary'
    }
  }
}

/* Quote Setup //////////////////////////////////////////////////////////////////
*/

var tquote = JSON.parse(localStorage.getItem(quotesls.quotetoload)); //get quote to load from localStorage

console.log('QUOTE: ',tquote);

if(tquote.info.build==undefined){
  tquote.info.build={ //declaration of build object
    systems:[]
  };
}
if(tquote.info.pricing==undefined){
  tquote.info.pricing = {}
}
if(tquote.info.contracts==undefined){
  tquote.info.contracts = {};
}

//var qbuild = tquote.info.build;
//var qkey = tquote.info.key; //point key to tquote
//var qprice = tquote.info.pricing;

console.log(tquote)

localStorage.setItem(quotesls.lastquote,JSON.stringify({id:tquote.id,name:tquote.name}));

/*
  {
    tiers:[],
    finance:[]
  }
*/
var qsettings=null;
ipcRenderer.send('GET-quotesettings','Initial');
ipcRenderer.on('GET-quotesettings',(eve,data)=>{
  if(data){
    qsettings = data;
    domtools.SETdatalistFROMobject(tquote.info.key.groups,'system-groups-list');
    sysbuild.InitSysBuild();
    custbuild.InitInfoBuild();
    sysbuild.modbuild.INITbuildmod();
    sysbuild.sumbuild.INITbuildsum();
  }
});
////////////////////////////////////////////////////////////////////////////////

// Page Setup //////////////////////////////////////////////////////////////////
 var qbook = new stdbook(blddom.pages.views,blddom.nav); //build module layout

// DOM Listeners ///////////////////////////////////////////////////////////////

let mactions={
  delete:{
    id:'delete-quote',
    src:'../bin/repo/assets/icons/trash.png',
    title: 'Delete Quote',
    ondblclick:(ele)=>{
      if(chckdeletequote){
        DropNote('tr','Deleting','green');
        ipcRenderer.send(quoteroutes.deletequote,tquote.id);
        chckdeletequote = false;
      }else{DropNote('tr','...Currently Deleteing','yellow');}
    }
  },
  refresh:{
    id:'refresh-quotekey',
    src:'../bin/repo/assets/icons/key.png',
    title: 'Refresh Price Key',
    ondblclick:(ele)=>{
      if(chcknewkey){
        console.log('Refresh Key')
        ipcRenderer.send(quoteroutes.refreshquotekey,'Refresh Quote Key...');
        chcknewkey = false;
      }else{DropNote('tr','...Currently Loading Key','yellow')}
    }
  },
  pricer:{
    id:'refresh-key',
    src:'../bin/repo/assets/icons/dollar-thin.png',
    title: 'Refresh Pricing',
    ondblclick:(ele)=>{
      tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
      console.log(tquote.info.pricing);
    }
  }
}
let qactions={
  save:{
    id:'save-quote',
    src:'../bin/repo/assets/icons/disk.png',
    title: 'Save Quote',
    ondblclick:(ele)=>{
      if(chcksavequote){
        SAVEquote();
        chcksavequote=false;
      }else{DropNote('tr','...Currently Saving','yellow');}
    }
  },
  swap:{
    id:'swaptable-quote',
    src:'../bin/repo/assets/icons/swaping.png',
    title:'Swap Table',
    onclick:(ele)=>{
      floatv.SELECTview(document.getElementById('quote-popview'),'Swap Table');
    }
  }
}
var closeeve=()=>{   // Event that fires when trying to close
  if(window.confirm('Please save before closing!\n\nPress "Okay" to close.\nPress "Cancel" to go back to save.')){
    window.close();
  }else{
  }
}


Titlebar.SETUPtitlebar(qactions,mactions,closeeve);
$(document.getElementById(Titlebar.tbdom.info.cont)).hide();
$(document.getElementById(Titlebar.tbdom.page.settings)).hide();

// WORKING VARIABLES //
var chckcreatecontract = true;
var chckdeletequote = true;
var chcksavequote = true;
var chcknewkey = true;
///////////////////////



ipcRenderer.on(quoteroutes.refreshquotekey,(eve,data)=>{
  chcknewkey = true;
  if(data.key && data.key!=undefined){
    DropNote('tr',data.msg,'green');
    tquote.info.key = data.key;//update tquote
    //qkey = tquote.info.key;//relink qkey
    console.log('QUOTE ',tquote);
  }else{DropNote('tr',data.msg,'red')}
});
ipcRenderer.on(quoteroutes.deletequote,(eve,data)=>{
  chckdeletequote = true;
  if(data.status){window.close();}
  else{DropNote('tr',data.msg,'red');}
});
ipcRenderer.on(quoteroutes.savequote,(eve,data)=>{
  chcksavequote = true;
  if(data.quote&&data.quote!=undefined){
    tquote = data.quote;
    console.log('QUOTE ',tquote);
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red')}
  TOGGLEsummary();
});
ipcRenderer.on(quoteroutes.createcontract,(eve,data)=>{
  if(data.status){
    if(data.quote&&data.quote!=undefined){
      tquote = data.quote; //to update the contract object
      SAVEquote();
    }
    DropNote('tr',data.msg,'green');
  }
  else{DropNote('tr',data.msg,'red'),true}
  chckcreatecontract = true;

});
ipcRenderer.on(navroutes.gotopresi,(eve,data)=>{
  if(data.quote&&data.quote!=undefined){
    DropNote('tr',data.msg,'green');
  }else{
    DropNote('tr',data.msg,'yellow');
  }
});

//////////////////////////////////////////////////

///// END PAGE SETUP / LISTENERS ///////////////////////////////////////////////


// Module Setup ////////////////////////////////////////////////////////////////
var custbuild=require('../bin/gui/quoter/rrq-buildinfo.js'); //Customer module
var modbuild = require('../bin/gui/quoter/rrq-buildmods.js');
var sumbuild = require('../bin/gui/quoter/rrq-buildsummary.js');
var sysbuild=require('../bin/gui/quoter/rrq-buildsys.js'); //Systems module
////////////////////////////////////////////////////////////////////////////////

document.getElementById(modbuild.moddom.cont).addEventListener('change',(ele)=>{ //change to Modifications
  modbuild.GETbuildmod(); //update Modifications
  tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
  for(let x=0;x<tquote.info.build.systems.length;x++){
    sumbuild.REFRESHsumsystem(tquote.info.build.systems[x],x);
  }
});
//  ACTIONS ////////////////////////////////////////////////////////////////////

document.getElementById('rrq-create-presentation').addEventListener('click',(ele)=>{
  //ipcRenderer.send(quoteroutes.createpresentation,{quote:})
  localStorage.setItem(quotesls.quotetopresi,JSON.stringify(tquote));
  ipcRenderer.send(navroutes.gotopresi,{quote:tquote});
});

////////////////////////////////////////////////////////////////////////////////

/* Saving Summary
    TOGGLEsummary - called to show and hide the summary so the back-end can
    print-screen the window. The function will show or hide dependant on the
    status of lastv.

    lastv - holds FALSE or the variable name (found in blddom.pages.views)
    associated with the name of the last open view before the function toggled
*/
let lastv = false;

var TOGGLEsummary=()=>{
  if(blddom.nav.viewbuttons[lastv]){
    document.getElementsByClassName(blddom.nav.left)[0].getElementsByClassName(blddom.nav.viewbuttons[lastv])[0].click();
    lastv = false;
  }else{
    lastv = qbook.GETcurrentview();
    document.getElementsByClassName(blddom.nav.right)[0].getElementsByClassName(blddom.nav.viewbuttons.summary)[0].click();
  }

}
///////////////////////////////////////
var SAVEquote = ()=>{
  custbuild.GETquoteinfo();
  tquote.info.build = sysbuild.GETsystems();
  modbuild.GETbuildmod();
  localStorage.setItem(quotesls.quotetoload,JSON.stringify(tquote)); //save to localStorage (quotetoload for dev)
  ipcRenderer.send(quoteroutes.savequote,{quote:tquote});//send quote to main
  TOGGLEsummary();
}
