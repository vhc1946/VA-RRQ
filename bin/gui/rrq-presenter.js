/*
*/
var {ipcRenderer, contextBridge}=require('electron');
var $ = require('jquery');
var RROOT = '../bin/repo/';
var Titlebar = require('../bin/repo/gui/js/modules/vg-titlebar.js');
var {DropNote}=require('../bin/repo/gui/js/modules/vg-dropnote.js');
var path=require('path');
var {auser} = require('../bin/appuser.js'); //initialize the app user object
var {quotesls}=require('../bin/gui/storage/lstore.js');
var {quoteroutes}=require('../bin/routes.js');
var apaths=require('../app/paths.json');

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

var presdom={
  cont:'rrq-multi-presentation',
  header:'rrq-presi-header',
  footer:'rrq-page-footer',
  sections:{
    header:'rrq-multi-cont-header',
    exp:'rrq-multi-cont-exp',
    comfort:'rrq-multi-cont-comfort',
    value:'rrq-multi-cont-value',
    headerprint:'rrq-multi-cont-headerprint',
    impact:'rrq-multi-cont-impact',
    enhance:'rrq-multi-cont-enhance',
    adds:'rrq-multi-cont-adds',
    finance:'rrq-multi-cont-finance',
    discount:'rrq-multi-cont-discount',
    partials:'rrq-multi-cont-partials'
  },
  icons:{
    experience:'rrq-icon-experience',
    cooling:'rrq-icon-cooling',
    heating:'rrq-icon-heating',
    soundslike:'rrq-icon-soundslike',
    filters:'rrq-icon-filters',
    value:'rrq-icon-value',
    impact:'rrq-icon-impact'
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
    src:'../bin/repo/assets/icons/angle-up.png',
    onclick:(ele)=>{CHANGEsys(ele);}
  },
  down:{
    id:pnavdom.system.down,
    src:'../bin/repo/assets/icons/angle-down.png',
    onclick:(ele)=>{CHANGEsys(ele);}
  }
}

Titlebar.SETUPtitlebar(qactions);

////////////////////

var tquote = JSON.parse(localStorage.getItem(quotesls.quotetopresi));
var cons=auser;
var asspath=null;
var currtier=0;
var sysnum=0;
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

  // Set Section Icons /////////////////////

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
    if(sysbuild.tiers[i].size){
      for(let key in presdom.sections){   // Shows sections of all tiers
        document.getElementsByClassName(`rrq-multi-cont-${key}`)[0].getElementsByClassName('rrq-multi-tier')[i].style.backgroundColor = '';
      }

      // User Experience ///////////
      document.getElementsByClassName(presdom.icons.experience)[i].src = diricon + '/SmileyFace_'+(i+1)+'.png';

      // Home Comfort //////////////
      document.getElementsByClassName(presdom.icons.cooling)[i].src = diricon + '/comfort-cooling_'+(sysbuild.tiers[i].info['feat_comfort_cooling'])+'.png';
      document.getElementsByClassName(presdom.icons.heating)[i].src = diricon + '/comfort-heating_'+(sysbuild.tiers[i].info['feat_comfort_heating'])+'.png';
      document.getElementsByClassName(presdom.icons.soundslike)[i].src = diricon + '/comfort-soundslike_'+(sysbuild.tiers[i].info['feat_comfort_soundslike'])+'.png';
      document.getElementsByClassName(presdom.icons.filters)[i].src = diricon + '/comfort-filters_'+(sysbuild.tiers[i].info['feat_comfort_filters'])+'.png';

      // Value /////////////////////
      document.getElementsByClassName('rrq-energy')[i].innerText = sysbuild.tiers[i].info['feat_value_energy'];
      document.getElementsByClassName('rrq-warranty')[i].innerText = sysbuild.tiers[i].info.warrlab;
      
      document.getElementsByClassName(presdom.icons.value)[i].src = diricon + '/value-icon_'+(sysbuild.tiers[i].info['feat_value'])+'.png';

      // Impact ////////////////////
      document.getElementsByClassName(presdom.icons.impact)[i].src = diricon + '/impact-icon_'+(sysbuild.tiers[i].info['feat_impact'])+'.png';
      
      document.getElementsByClassName('rrq-impact-carbonreduct')[i].innerText = sysbuild.tiers[i].info['feat_impact_carbonreduct'] + '% Reduction';
      document.getElementsByClassName('rrq-impact-emissions')[i].innerText = sysbuild.tiers[i].info['feat_impact_emissions'] + ' Metric Tons';
      document.getElementsByClassName('rrq-impact-trees')[i].innerText = sysbuild.tiers[i].info['feat_impact_trees'] + ' Trees';

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
    }else{
      for(let key in presdom.sections){   // Hides sections of empty tiers
        let section = document.getElementsByClassName(`rrq-multi-cont-${key}`)[0].getElementsByClassName('rrq-multi-tier')[i];
        section.style.backgroundColor = 'grey';
      }
      for(let key in presdom.icons){   // Adds placeholder icons so page doesn't shift during printing
        if(key != 'experience'){
          document.getElementsByClassName(`rrq-icon-${key}`)[i].src = diricon + '/placeholder.png';
        }
      }
      document.getElementsByClassName('rrq-multi-tier-enhance')[i].innerHTML = '';
      document.getElementsByClassName('rrq-multi-tier-adds')[i].innerHTML = '';
      document.getElementsByClassName("rrq-multi-tier-discount")[i].innerHTML = "";
    }
  }
}

var CHANGEsys=(ele)=>{
  if(ele.target.id==pnavdom.system.down){
    sysnum--;if(sysnum<0){sysnum=tquote.info.build.systems.length-1;}
  }else{
    sysnum++;if(sysnum>=tquote.info.build.systems.length){sysnum=0;}
  }
  LOADresipresi();
}

if(tquote){
  console.log('QUOTE >',tquote);
  localStorage.setItem(quotesls.quotetopresi,null)
  asspath = path.join(auser.cuser.spdrive,apaths.deproot,apaths.assets.root);
  LOADresipresi();
}
else{DropNote('tr','Quoute Could NOT Load','red',true);}