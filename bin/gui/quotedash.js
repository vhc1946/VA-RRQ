var {navroutes,loginroutes,qdashroutes,quoteroutes} = require('../bin/routes.js'); //Routes to Main Process
const $ = require('jquery');
var {ipcRenderer}=require('electron');

var RROOT='../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var gentable = require('../bin/repo/gui/js/modules/vg-tables.js');
var floatv = require('../bin/repo/gui/js/modules/vg-floatviews.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');

var vcontrol = require('../bin/repo/gui/js/layouts/view-controller.js');

var {ObjList}=require('../bin/repo/tools/box/vg-lists.js');
var gendis = require('../bin/repo/gui/js/tools/vg-displaytools.js');

var {CREATEticket} = require('../bin/repo/logger/things/support-form.js');

var {usersls,quotesls}=require('../bin/gui/storage/lstore.js');

var uquotes = new ObjList();
var quoteset = null;
var toloadquote = false; //when "getting" quote FALSE(does not load quoter) TRUE(does load quoter)

var quotefloat = document.getElementById('quote-center');


var qddom={
  cont:'quote-tables-container',
  actions:{
    createnewquote:'quote-action-createnewquote',
    resumelastquote:'quote-action-resumelastquote'
  },
  tables:{
    cont:'quote-tables-container',
    row:'quote-table-row'
  }
}

var predom={
  cont:'vg-center-info-preview',
  client:{
    name:'preview-value-cname',
    jaddy:'preview-value-jaddy',
    caddy:'preview-value-caddy',
    phone1:'preview-value-phone1',
    email:'preview-value-email'
  },
  created:'preview-value-created',
  saved:'preview-value-saved',
  buttons:{
    open:'open-cur-quote',
    close:'close-preview',
    sell:'sell-cur-quote'
  }
}

var newdom={
  cont:'vg-center-info-newquote',
  job:'newquote-jobname',
  client:{
    first:'newquote-clientfirst',
    last:'newquote-clientlast',
    phone:'newquote-clientphone',
    email:'newquote-clientemail'
  },
  button:'submit-new-quote'
}



// Initialize localStorage /////////////////////////////////////////////////////
try{
  let ql = JSON.parse(localStorage.getItem(quotesls.lastquote));
  if(ql.id==undefined){localStorage.setItem(quotesls.lastquote,JSON.stringify({id:'',name:''}))}
}catch{}
////////////////////////////////////////////////////////////////////////////////

ipcRenderer.send('GET-quotesettings',"Request quote settings"); //Request quote settings
ipcRenderer.send(qdashroutes.getuserquotes,"Requesting quote list...");//request user list

//  TITLE BAR //
try{
  document.getElementById(Titlebar.tbdom.info.username).innerText = JSON.parse(localStorage.getItem(usersls.curruser)).uname;
}catch{}

document.getElementById(Titlebar.tbdom.page.user).addEventListener('dblclick',(ele)=>{//GOTO LOGIN
  ipcRenderer.send(navroutes.gotologin,'Opening Login Dash...');
});
document.getElementById(Titlebar.tbdom.page.settings).addEventListener('dblclick',(ele)=>{//GOTO SETTINGS
  ipcRenderer.send(navroutes.gotosettings,'Open Settings...');
});

let mactions={
  support:{
    id:'support-ticket',
    src:'../bin/repo/assets/icons/info.png',
    title:'Support',
    ondblclick:(ele)=>{CREATEticket();}
  }
}
let qactions={
  refresh:{
    id:'refresh-dash',
    src:'../bin/repo/assets/icons/refresh-icon.png',
    title:'Refresh Dash',
    ondblclick:(ele)=>{ipcRenderer.send(qdashroutes.getuserquotes,"Refresh Dash...");}
  }
}

Titlebar.SETUPtitlebar(qactions,mactions);

/////////////////

//  QUOTE TABLE //
var quotetableheads={
  O:{
    id:'ID',
    name:'JOB NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'OPEN DATE'
  },
  S:{
    id:'ID',
    name:'JOB NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'SUBMIT Date'
  },
  I:{
    id:'ID',
    name:'JOB NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'JOB Date'
  },
  C:{
    id:'ID',
    name:'JOB NAME',
    estimator:'CONSULTANT',
    street:'ADDRESS',
    customer:{
      name:'CUSTOMER'
    },
    opendate:'CLOSE DATE'
  }
}
var quotetablemaps={
  O:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      opendate:r.opendate||'',
    }
  },
  S:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      subdate:r.subdate||'',
    }
  },
  I:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      apprdate:r.apprdate||'',
    }
  },
  C:(r=null)=>{
    if(!r||r==undefined){console.log(r);r={}}
    return{
      id:r.id||'',
      name:r.name||'',
      estimator:r.estimator||'',
      street:r.street||'',
      customer:r.customer!=undefined? r.customer.name||'':'',
      closedate:r.closedate||'',
    }
  }
}
var qtableacts = {
  createnewquote:{
    id:'quote-action-createnewquote',
    src:'../bin/repo/assets/icons/open-new.png'
  },
  resumelastquote:{
    id:'quote-action-resumelastquote',
    src:'../bin/repo/assets/icons/open-last.png'
  }
}

//vcontrol.SETUPviews(document.getElementById(qddom.tables.cont),'mtl');
var qtableviews = new vcontrol.ViewGroup({
  cont:document.getElementById(qddom.tables.cont),
  type:'mtl',
  qactions:qtableacts
});

/* Set/Reset the quote TABLES
    Quote tables are based on the quote.status. Appset is used to determine
    the status' to include in the set of tables.
*/
var SETquotetable=()=>{
  let tcont = document.getElementById(qddom.tables.cont);
  qtableviews.CLEARview(tcont);

  let fbutton = null;
  //tcont
  for(let s in quoteset.status){
    var v = document.createElement('div');
    let l = [].concat(quotetableheads[s],uquotes.TRIMlist({status:s}));
    v = qtableviews.ADDview(quoteset.status[s],v);
    v.appendChild(document.createElement('div'));
    v.lastChild.classList.add(gentable.gtdom.table);
    gentable.BUILDtruetable(l,v.lastChild,true,qddom.tables.row,quotetablemaps[s]);

  }

  qtableviews.buttons.children[0].click(); //fires a click event

}

qtableviews.port.addEventListener('dblclick',(ele)=>{
  let lrow = gendis.FINDparentele(ele.target,qddom.tables.row);
  if(lrow){
    //transform to object
    ipcRenderer.send(qdashroutes.getquote,{id:lrow.children[0].innerText});
  }
});

// FILTERING  //

//  DASH ACTIONS //
document.getElementById(qddom.actions.createnewquote).addEventListener('dblclick',(ele)=>{//Create New Quote
  floatv.SELECTview(document.getElementById('quote-center'),'New Quote');//open new quote preview
});
document.getElementById(qddom.actions.resumelastquote).addEventListener('dblclick',(ele)=>{//Resume Last Quote
  let lquote = JSON.parse(localStorage.getItem(quotesls.lastquote)).id;
  if(lquote&&lquote!=undefined){
    console.log(lquote);
    ipcRenderer.send(qdashroutes.getquote,{id:lquote});
    toloadquote=true;
  }else{
    DropNote('tr','No Quote to Load','red');
  }
});

document.getElementById(newdom.job).addEventListener('keypress',(eve)=>{
  if(eve.key == 'Enter'){document.getElementById(newdom.button).click();};
});
for(let i in newdom.client){
  document.getElementById(newdom.client[i]).addEventListener('keypress',(eve)=>{
    if(eve.key == 'Enter'){document.getElementById(newdom.button).click();};
  });
}
document.getElementById(newdom.button).addEventListener('click',(ele)=>{
  let tempobj = {
    name:document.getElementById(newdom.job).value,
    customer:{
      name:document.getElementById(newdom.client.last).value + ', ' + document.getElementById(newdom.client.first).value,
      phone:document.getElementById(newdom.client.phone).value,
      email:document.getElementById(newdom.client.email).value
    }
  };

  ipcRenderer.send(qdashroutes.createquote,tempobj);

})


/* RESPONSE with user quotes
  data:{
    msg //some message
    quotes: [] //array of user quotes
  }
*/
ipcRenderer.on(qdashroutes.getquote,(eve,data)=>{
  console.log('QUOTE-',data);
  if(data.quote&&data.quote!=undefined){
    DropNote('tr',data.msg,'green');
    localStorage.setItem(quotesls.quotetoload,JSON.stringify(data.quote));
    if(toloadquote){
      ipcRenderer.send(qdashroutes.loadquote,{id:data.quote.id});
      toloadquote=false;
    }
    else{
      POPpreview(data.quote);
      floatv.SELECTview(quotefloat,'Preview Quote');
    }
  }else{DropNote('tr',data.msg,'yellow')}
});
ipcRenderer.on(qdashroutes.getuserquotes,(eve,data)=>{
  console.log('loading')
  if(quoteset&&data.quotes){
    console.log(data.quotes);

    uquotes.SETlist(data.quotes);
    SETquotetable();
    DropNote('tr','User Quotes Loaded','green');
  }
});
ipcRenderer.on(qdashroutes.loadquote,(eve,data)=>{
  if(data.id){
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red');}
});
ipcRenderer.on(qdashroutes.createquote,(eve,data)=>{
  if(data.quote){
    DropNote('tr',data.msg,'green');
    localStorage.setItem(quotesls.quotetoload,JSON.stringify(data.quote));
    ipcRenderer.send(qdashroutes.loadquote,{id:data.quote.id});
    floatv.RESETframe(document.getElementById('quote-center'));
    document.getElementById(newdom.job).value = '';
    for(let x in newdom.client){
      document.getElementById(newdom.client[x]).value='';
    }
  }else{DropNote('tr',data.msg,'red')}
});
ipcRenderer.on('GET-quotesettings',(eve,data)=>{
  if(data.status!=undefined){
    quoteset = data;
  }
});
ipcRenderer.on(quoteroutes.sellquote,(eve,data)=>{
  if(data.status){
    DropNote('tr',data.msg,'green');
  }else{DropNote('tr',data.msg,'red')}
});





//  Float Views ////////////////////////////////////////////

var POPpreview=(quote)=>{
  let preview = new vcontrol.ViewGroup({create:false,cont:document.getElementById('preview-area-systems'),type:'mtl'});

  document.getElementById('preview-quote-id').innerText = quote.id;
  document.getElementById(predom.client.name).innerText = quote.customer.name;
  document.getElementById(predom.client.jaddy).innerText = quote.street;
  document.getElementById(predom.client.caddy).innerText = quote.customer.street;
  document.getElementById(predom.client.phone1).innerText = quote.customer.phone;
  document.getElementById(predom.client.email).innerText = quote.customer.email;
  document.getElementById(predom.created).innerText = quote.opendate.split('T')[0];
  document.getElementById(predom.saved).innerText = quote.lastdate.split('T')[0];


  let menutemp = document.getElementById('preview-area-systems').getElementsByClassName(vcontrol.vcdom.menu.cont)[0];
  preview.CLEARview();
  //$(preview.menu).removeClass();
  //menutemp.classList.add(vcontrol.vcdom.menu.cont);

  if(quote.info.pricing!=undefined&&quote.info.pricing.systems!=undefined){
    for(let x=0;x<quote.info.pricing.systems.length;x++){
      preview.ADDview(quote.info.pricing.systems[x].name,PREVIEWpricing(quote,x));
    }
  }else{
    let noprice = document.getElementById('preview-area-systems').getElementsByClassName(vcontrol.vcdom.port.cont)[0];
    noprice.appendChild(document.createElement('div'));
    noprice.lastChild.classList.add('noprice-note');
    noprice.lastChild.innerHTML = "No pricing has been set up for this quote yet.";
  }

}

var PREVIEWpricing=(quote,sysnum)=>{
  let firstspot = document.createElement('div');
  let spot = firstspot.appendChild(document.createElement('div'));
  spot.classList.add('preview-area-system');
  let system = quote.info.pricing.systems[sysnum];
  if(system.tiers){
    for(let x=0;x<system.tiers.length;x++){
      let optspot = spot.appendChild(document.createElement('div'));
      optspot.classList.add('preview-area-option');
      optspot.appendChild(document.createElement('div'));
      optspot.lastChild.innerText = system.tiers[x].name;
      for(let y=0;y<system.tiers[x].priceops.length;y++){
        optspot.appendChild(document.createElement('div'));
        optspot.lastChild.innerText = system.tiers[x].priceops[y].payment.title + ': ' + Math.trunc(system.tiers[x].priceops[y].opts.sysprice.price);
      }
    }
  }
  return firstspot;
}

document.getElementById(predom.buttons.open).addEventListener('dblclick',(ele)=>{
  let lquote = JSON.parse(localStorage.getItem(quotesls.quotetoload)).id;
  if(lquote&&lquote!=undefined){
    ipcRenderer.send(qdashroutes.getquote,{id:lquote});
    toloadquote=true;
    floatv.RESETframe(quotefloat);
  }else{
    DropNote('tr','No Quote to Load','red');
  }
});
document.getElementById(predom.buttons.sell).addEventListener('dblclick',(ele)=>{
  let lquote = JSON.parse(localStorage.getItem(quotesls.quotetoload));
  if(lquote && lquote!=undefined){ipcRenderer.send(quoteroutes.sellquote,lquote);}
});
