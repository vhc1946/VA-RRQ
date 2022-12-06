/*
*/
var {ipcRenderer, contextBridge}=require('electron');
var $ = require('jquery');
var RROOT = '../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');
var path=require('path');

var {quotesls}=require('../bin/gui/storage/lstore.js');
var {quoteroutes}=require('../bin/routes.js');


var qsettings=null;

ipcRenderer.send('GET-quotesettings','Initial'); //request quote settings
ipcRenderer.on('GET-quotesettings',(eve,data)=>{
  if(data){
    qsettings = data;
  }
});

// TITLE bar //

var pnavdom = {
  cont:'page-buttons',
  tier:{
    left:'tier-left',
    right:'tier-right',
    tag:'tier-name'
  },
  system:{
    up:'sys-up',
    down:'sys-down',
    tag:'sys-name'
  }
}

var qactions={
  part:{
    id:'partials-toggle',
    src:'../bin/repo/assets/icons/layers.png',
    onclick:(ele)=>{$(document.getElementsByClassName('rrq-multi-cont-partials')[0]).toggle();}
  },
  up:{
    id:pnavdom.system.up,
    src:'../bin/repo/assets/icons/angle-down.png',
    onclick:CHANGEsys
  },
  down:{
    id:pnavdom.system.down,
    src:'../bin/repo/assets/icons/angle-up.png',
    onclick:CHANGEsys
  }
}

Titlebar.SETUPtitlebar(qactions);

////////////////////


var apaths=require('../app/paths.json');
var tquote=null;
var cons=null;
var asspath=null;
var currtier=0;
var sysnum=0;

ipcRenderer.send(quoteroutes.createpresentation,'Open Presentation'); //request quote data
ipcRenderer.on(quoteroutes.createpresentation,(eve,data)=>{
  if(data.quote&&data.quote!=undefined){
    console.log('QUOTE >',data.quote);
    console.log('USER >',data.user);
    tquote = data.quote;
    cons = data.user.config;
    asspath = path.join(data.user.cuser.spdrive,apaths.deproot,apaths.assets.root);
    LOADresipresi();
  }
});

var tiersettings =[];//holds tier info



var LOADresipresi=()=>{

  document.getElementById(Titlebar.tbdom.title).innerText = tquote.info.build.systems[sysnum].name;
  let sysbuild = tquote.info.build.systems[sysnum];
  let diricon = path.join(asspath,apaths.assets.pvicons);
  let dirlogo = path.join(asspath,apaths.assets.logos);

  // Print Header /////////////////

  document.getElementById('header-client-name').innerText = tquote.customer.name;
  document.getElementById('header-client-street').innerText = tquote.street;
  document.getElementById('header-client-longcity').innerText = tquote.city + ', ' + tquote.state + ' ' + tquote.zip;
  document.getElementById('header-client-system').innerText = tquote.info.build.systems[sysnum].name;
  document.getElementById('cons-phone').innerText = cons.cell;
  document.getElementById('cons-name').innerText = cons.name;
  document.getElementById('vogel-logo').src = dirlogo + '/Vogel Logo.png';

  // Set icons /////////////////////

  document.getElementById('experience-main-icon').src = diricon + '/UserExperience.png';
  document.getElementById('comfort-main-icon').src = diricon + '/ComfortIcon.png';
  document.getElementById('value-main-icon').src = diricon + '/ValueIcon-01.png';
  document.getElementById('impact-main-icon').src = diricon + '/ImpactIcon-01.png';
  document.getElementById('enhance-main-icon').src = diricon + '/EnhancementIconV3.png';
  document.getElementById('adds-main-icon').src = diricon + '/ModificationIconV1.png';
  document.getElementById('finance-main-icon').src = diricon + '/InvestmentTag-01.png';
  document.getElementById('discount-main-icon').src = diricon + '/CashBackIcon.png';
  document.getElementById('partial-main-icon').src = diricon + '/StepIcon_V2-01.png';


  for(let i=0;i<sysbuild.tiers.length;i++){

    // User Experience ///////////

    document.getElementsByClassName('rrq-user-experience')[i].src = diricon + '/SmileyFace_'+(i+1)+'.png';

    // Home Comfort //////////////
    document.getElementsByClassName('rrq-pres-comfort-cooling')[i].src = diricon + '/comfort-cooling_'+(sysbuild.tiers[i].info['feat_comfort_cooling'])+'.png';
    document.getElementsByClassName('rrq-pres-comfortfeels-cooling')[i].src = diricon + '/comfort-coolingfeels_'+(sysbuild.tiers[i].info['feat_comfort_coolingfeels'])+'.png';

    document.getElementsByClassName('rrq-pres-comfort-heating')[i].src = diricon + '/comfort-heating_'+(sysbuild.tiers[i].info['feat_comfort_heating'])+'.png';
    document.getElementsByClassName('rrq-pres-comfortfeel-heating')[i].src = diricon + '/comfort-heatingfeels_'+(sysbuild.tiers[i].info['feat_comfort_heatingfeels'])+'.png';

    document.getElementsByClassName('rrq-pres-comfort-soundslike')[i].src = diricon + '/comfort-soundslike_'+(sysbuild.tiers[i].info['feat_comfort_soundslike'])+'.png';
    document.getElementsByClassName('rrq-pres-comfort-filters')[i].src = diricon + '/comfort-filters_'+(sysbuild.tiers[i].info['feat_comfort_filters'])+'.png';

    // Value /////////////////////
    document.getElementsByClassName('rrq-energy')[i].innerText = sysbuild.tiers[i].info['feat_value_energy'];
    document.getElementsByClassName('rrq-warranty')[i].innerText = sysbuild.tiers[i].info.warrlab;
    document.getElementsByClassName('value-icon')[i].src = diricon + '/value-icon_'+(sysbuild.tiers[i].info['feat_value'])+'.png';

    // Impact ////////////////////
    document.getElementsByClassName('rrq-impact-pic')[i].src=diricon + '/impact-icon_'+(sysbuild.tiers[i].info['feat_impact'])+'.png';
    document.getElementsByClassName('rrq-impact-carbonreduct')[i].innerText = sysbuild.tiers[i].info['feat_impact_carbonreduct'] + '% Reduction';
    document.getElementsByClassName('rrq-impact-emissions')[i].innerText = sysbuild.tiers[i].info['feat_impact_emissions'] + ' Metric Tons';
    document.getElementsByClassName('rrq-impact-trees')[i].innerText = sysbuild.tiers[i].info['feat_impact_trees'] + ' Trees';

    ///////////////////////////////


    // Enhancements /////////////////////////////////////
    document.getElementsByClassName('rrq-multi-tier-enhance')[i].innerHTML = '';
    for(let e=0;e<tquote.info.build.systems[sysnum].enhancments.length;e++){
      if(tquote.info.build.systems[sysnum].enhancments[e].tiers[i]>=1){
        let spot = document.getElementsByClassName('rrq-multi-tier-enhance')[i];
        spot.appendChild(document.createElement('div'));
        spot.lastChild.innerText = tquote.info.build.systems[sysnum].enhancments[e].name;
      }
    }

    // Modifications ///////////////////////////////////
    if(tquote.info.build.systems[sysnum].additions.length==0){
      $(document.getElementsByClassName('rrq-multi-cont-adds')[0]).hide();
    }else{
      $(document.getElementsByClassName('rrq-multi-cont-adds')[0]).show();
      document.getElementsByClassName('rrq-multi-tier-adds')[i].innerHTML = '';
      for(let e=0;e<tquote.info.build.systems[sysnum].additions.length;e++){
        if(tquote.info.build.systems[sysnum].additions[e].tiers[i]>=1){
          let spot = document.getElementsByClassName('rrq-multi-tier-adds')[i];
          spot.appendChild(document.createElement('div'));
          spot.lastChild.innerText = tquote.info.build.systems[sysnum].additions[e].name;
        }
      }
    }



    //  Rebates / Discounts ////////////////////////////
    let disc = document.createElement('div');
    disc.classList.add('rrq-disc-applied');
    let discounts = tquote.info.build.systems[sysnum].discounts;
    console.log(discounts);
    for(let d=0;d<discounts.length;d++){
      if(discounts[d].tiers[i]>0){
        disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
        disc.lastChild.appendChild(document.createElement('div')).innerText = discounts[d].name
        disc.lastChild.appendChild(document.createElement('div')).innerText = discounts[d].tiers[i]
      }
    }
    disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
    disc.lastChild.appendChild(document.createElement('div')).innerText = `Ameren (${tquote.info.build.systems[sysnum].tiers[i].size.seer} SEER)`;
    if(tquote.info.build.systems[sysnum].tiers[i].size.rebateelec==''){
      disc.lastChild.appendChild(document.createElement('div')).innerText = 0;
    }else{
      disc.lastChild.appendChild(document.createElement('div')).innerText = tquote.info.build.systems[sysnum].tiers[i].size.rebateelec;
    }

    if(tquote.info.build.systems[sysnum].tiers[i].size.rebategas!=''){
      disc.appendChild(document.createElement('div')).classList.add('rrq-disc-row');
      disc.lastChild.appendChild(document.createElement('div')).innerText = 'Spire (Post-Purchase)';
      disc.lastChild.appendChild(document.createElement('div')).innerText = tquote.info.build.systems[sysnum].tiers[i].size.rebategas;
    }

    document.getElementsByClassName("rrq-multi-tier-discount")[i].innerHTML = "";
    document.getElementsByClassName("rrq-multi-tier-discount")[i].appendChild(disc);



    // Investment /////////////////////////////////////
    document.getElementsByClassName('fin-uf-price')[i].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[0].opts.sysprice.price);
    document.getElementsByClassName('fin-promo-price')[i].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.sysprice.price);
    document.getElementsByClassName('fin-promo-mo')[i].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.sysprice.monthly);
    document.getElementsByClassName('fin-low-mo')[i].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[2].opts.sysprice.monthly);

    // Partials ///////////////////////////////////////
    document.getElementsByClassName('rrq-part-upfront')[i].childNodes[2].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[0].opts.outprice.price);
    document.getElementsByClassName('rrq-part-upfront')[i].childNodes[3].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[0].opts.inprice.price);
    document.getElementsByClassName('rrq-part-lowest')[i].childNodes[2].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[2].opts.outprice.monthly);
    document.getElementsByClassName('rrq-part-lowest')[i].childNodes[3].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[2].opts.inprice.monthly);
    document.getElementsByClassName('rrq-part-promo')[i].childNodes[2].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.outprice.price);
    document.getElementsByClassName('rrq-part-promo')[i].childNodes[3].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.inprice.price);
    document.getElementsByClassName('rrq-part-promomo')[i].childNodes[2].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.outprice.monthly);
    document.getElementsByClassName('rrq-part-promomo')[i].childNodes[3].innerText = Math.trunc(tquote.info.pricing.systems[sysnum].tiers[i].priceops[1].opts.inprice.monthly);
  }
}

var CHANGEsys=(ele)=>{
  console.log('here')
  if(ele.target.id==pnavdom.system.down){
    sysnum--;if(sysnum<0){sysnum=tquote.info.build.systems.length-1;}
  }else{
    sysnum++;if(sysnum>=tquote.info.build.systems.length){sysnum=0;}
  }
  LOADresipresi();
}

var CHANGEtier=(ele)=>{
  if(ele.target.id=='run-left'){
    currtier--;
  }else{currtier++}
  if(currtier<0){currtier=tiersettings.length-1}
  if(currtier==tiersettings.length){currtier=0}
  LOADresipresi();
}

var SETUPpresnav=()=>{
  let pcont = document.createElement('div');
  pcont.classList.add('page-buttons');
  pcont.appendChild(document.createElement('div'));
  pcont.lastChild.innerText = "Left"
  pcont.lastChild.id = pnavdom.tier.left;
  pcont.appendChild(document.createElement('span'));
  pcont.lastChild.innerText = 'TIERS';
  pcont.lastChild.id = pnavdom.tier.tag;
  pcont.appendChild(document.createElement('div'));
  pcont.lastChild.innerText = 'Right';
  pcont.lastChild.id = pnavdom.tier.right;

  let scont = document.createElement('div');
  scont.classList.add('system-controls');
  scont.appendChild(document.createElement('div'));
  scont.lastChild.id = pnavdom.system.up;
  scont.lastChild.innerText = 'Up';
  scont.appendChild(document.createElement('span'));
  scont.lastChild.innerText = 'SYSTEMS';
  scont.lastChild.id = pnavdom.system.tag;
  scont.appendChild(document.createElement('div'));
  scont.lastChild.id = pnavdom.system.down;
  scont.lastChild.innerText = 'Down';



  document.getElementById(Titlebar.tbdom.title).innerText = '';
  document.getElementById(Titlebar.tbdom.title).appendChild(pcont);
  document.getElementById(Titlebar.tbdom.title).appendChild(scont);
  document.getElementById('test-area').appendChild(scont);

  document.getElementById(pnavdom.system.up).addEventListener('click',CHANGEsys);
  document.getElementById(pnavdom.system.down).addEventListener('click',CHANGEsys);

  document.getElementById(pnavdom.tier.left).addEventListener('click',CHANGEtier);
  document.getElementById(pnavdom.tier.right).addEventListener('click',CHANGEtier);
}

module.exports={

}
