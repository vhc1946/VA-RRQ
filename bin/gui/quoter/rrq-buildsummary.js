//create element object
var bsdom ={
  cont:'summary-system-cont',
  system:{
    port:'summary-systems-port',
    cont:'summary-systems-cont',
    tier:{
      cont:'tier-cont',
      finance:{
        cont:'summary-tier-finance',
        partials:'summary-partials',
        indoor:'summary-finance-indoor',
        outdoor:'summary-finance-outdoor',
        system:'summary-finance-system'
      },
      enhance:'summary-tier-enhance',
      mods:'summary-tier-mods',
      equip:'summary-tier-equip',
      name:'tier-equip-name',
      brand:'tier-equip-brand',
      disc:'summary-tier-disc'
    }
  }
}

var discdom={
  multisys:'ms-disc',
  friendnfam:'ff-disc',
  noremorse:'nr-disc'
}

var finalc = require('./rrq-buildfinal.js');

var sumviews = new vcontrol.ViewGroup({
  create:false,
  cont:document.getElementById(bsdom.cont),
  type:'mtl'
})


var INITbuildsum=()=>{
  for(let x=0;x<tquote.info.build.systems.length;x++){
    sumviews.ADDview(tquote.info.build.systems[x].name,ADDsumsystem(x,tquote.info.build.systems[x]));
  }
}
var REFRESHsumsystem=(sysinfo,sysid)=>{
  let views = sumviews.port.children;
  views[sysid].innerHTML = '';
  views[sysid].appendChild(ADDsumsystem(sysid,sysinfo).children[0]);
}

var ADDsumsystem=(sysnum=null,sysinfo=null)=>{
  var newsys = document.createElement('div');
  newsys.classList.add(bsdom.system.port);

  var innercont = newsys.appendChild(document.createElement('div')); //Wraps all Tier Options
  innercont.classList.add(bsdom.system.cont);

  if(sysinfo!=undefined&&sysinfo.tiers!=undefined){
    for(let t=0;t<sysinfo.tiers.length;t++){
      innercont.appendChild(GENsumtier(sysinfo, sysnum, t));
    }
  }else{
    innercont.appendChild(document.createElement('div')).innerText = 'No equipment options selected yet!';
    innercont.lastChild.classList.add('notice-text');
  }

  return newsys;
}

var GETsumsystems=()=>{
  let views = sumviews.port.children;
  let systems = []
  for(let x=0;x<views.length;x++){
    systems.push(views[x].innerHTML);
  }
  return systems;
}

var GENsumtier=(sysinfo, sysnum, optnum)=>{
  let tiercont = document.createElement('div'); //Wraps whole Tier Option
  tiercont.classList.add(bsdom.system.tier.cont);
  tiercont.appendChild(document.createElement('div')).classList.add(bsdom.system.tier.name);
  tiercont.lastChild.innerText = sysinfo.tiers[optnum].name;
  tiercont.appendChild(GENsumfinance(sysinfo, sysnum, optnum));//add financing
  tiercont.appendChild(GENsumequip(sysinfo,optnum)); //add equipment
  tiercont.appendChild(GENsumenhance(sysinfo,optnum)); //add enhancements
  tiercont.appendChild(GENsummods(sysinfo,optnum)); //add modification
  tiercont.appendChild(GENsumdisc(sysinfo, sysnum ,optnum)); //add discounts
  return tiercont;
}

var GENsumequip=(sysinfo,optnum)=>{
  let equipcont =document.createElement('div'); //Wraps Equip Section
  equipcont.classList.add(bsdom.system.tier.equip);
  if(sysinfo.tiers[optnum].size!=undefined){
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = sysinfo.tiers[optnum].info.mfg;
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = sysinfo.tiers[optnum].size.outmodel;
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = sysinfo.tiers[optnum].size.innmodel;
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = sysinfo.tiers[optnum].size.inmodel;
    equipcont.appendChild(document.createElement('div'));
    equipcont.lastChild.innerText = sysinfo.tiers[optnum].size.statmodel;
  }else{
    equipcont.innerText = 'No equip opt selected.';
    equipcont.classList.add('notice-text');
  }
  return equipcont;
}

var GENsumenhance=(sysinfo, optnum)=>{
  let enhancecont = document.createElement('div');
  enhancecont.classList.add(bsdom.system.tier.enhance);
  if(sysinfo.enhancments!=undefined){
    for(let x=0;x<sysinfo.enhancments.length;x++){
      enhancecont.appendChild(document.createElement('div'));
      enhancecont.lastChild.innerText = sysinfo.enhancments[x].name;
      if(sysinfo.enhancments[x].tiers[optnum]>0){$(enhancecont.lastChild).css('color','green');}
      else if(sysinfo.enhancments[x].tiers[optnum]<0){$(enhancecont.lastChild).css('color','red');}
      else{$(enhancecont.lastChild).css('color','gray');}
    };
  }
  return enhancecont;
}

var GENsummods=(sysinfo, optnum)=>{
  let modcont = document.createElement('div');
  if(sysinfo.additions){
    modcont.classList.add(bsdom.system.tier.mods);
    for(let x=0;x<sysinfo.additions.length;x++){
      modcont.appendChild(document.createElement('div'));
      modcont.lastChild.innerText = sysinfo.additions[x].name;
      if(sysinfo.additions[x].tiers[optnum]>=1){
        $(modcont.lastChild).css('color','green');
      }else{
        $(modcont.lastChild).css('color','red');
      }
    }
  }
  return modcont;
}

var GENsumfinance=(sysinfo, sysnum, optnum)=>{
  let fincont = document.createElement('div');
  fincont.classList.add(bsdom.system.tier.finance.cont);
  if(tquote.info.pricing!=undefined&&tquote.info.pricing.systems[sysnum]!=undefined){
    let priceopts = tquote.info.pricing.systems[sysnum].tiers[optnum].priceops;
    let syscont = fincont.appendChild(document.createElement('div'));
    syscont.classList.add(bsdom.system.tier.finance.system);
    syscont.appendChild(document.createElement('div'));
    syscont.lastChild.innerText = "SYSTEM";
    for(let p=0;p<priceopts.length;p++){
      syscont.appendChild(document.createElement('div'));
      syscont.lastChild.innerText = priceopts[p].payment.title + ': ' + Math.trunc(priceopts[p].opts.sysprice.price);
      syscont.lastChild.addEventListener('dblclick',(ele)=>{
        POPsummary(tquote,sysnum,p,optnum,'SYS');
        floatv.SELECTview(document.getElementById('quote-popview'),'Summary Preview');
        /*
        if(chckcreatecontract){
          DropNote('tr','Creating Contract','green');
          ipcRenderer.send(quoteroutes.createcontract,{quote:tquote,contract:finalc.CREATEfinal(tquote,sysnum,p,optnum,'SYS')});
          chckcreatecontract=false;
        }else{DropNote('tr','...Creating Contract','yellow')}
        */
      });
    }

    let partcont = fincont.appendChild(document.createElement('div'));
    partcont.classList.add(bsdom.system.tier.finance.partials);

    let incont = partcont.appendChild(document.createElement('div'));
    incont.classList.add(bsdom.system.tier.finance.indoor);
    incont.appendChild(document.createElement('div'));
    incont.lastChild.innerText = "INDOOR";
    for(let p=0;p<priceopts.length;p++){
      incont.appendChild(document.createElement('div'));
      incont.lastChild.innerText = priceopts[p].payment.title + ': ' + Math.trunc(priceopts[p].opts.inprice.price);
      incont.lastChild.addEventListener('dblclick',(ele)=>{
        POPsummary(tquote,sysnum,p,optnum,'IN');
        floatv.SELECTview(document.getElementById('quote-popview'),'Summary Preview');
      });
    }

    let outcont = partcont.appendChild(document.createElement('div'));
    outcont.classList.add(bsdom.system.tier.finance.outdoor);
    outcont.appendChild(document.createElement('div'));
    outcont.lastChild.innerText = "OUTDOOR";
    for(let p=0;p<priceopts.length;p++){
      outcont.appendChild(document.createElement('div'));
      outcont.lastChild.innerText = priceopts[p].payment.title + ': ' + Math.trunc(priceopts[p].opts.outprice.price);
      outcont.lastChild.title = "Manf Reb: 0" + "\n" + priceopts[p].payment.lender;
      outcont.lastChild.addEventListener('dblclick',(ele)=>{
        POPsummary(tquote,sysnum,p,optnum,'OUT');
        floatv.SELECTview(document.getElementById('quote-popview'),'Summary Preview');
      });
    }
  }else{
    fincont.innerText = 'No financial info generated yet.';
    fincont.classList.add('notice-text');
  }
  return fincont;
}

var GENsumdisc=(sysinfo,sysnum,optnum)=>{
  let discont = document.createElement('div');
  let discounts = tquote.info.build.systems[sysnum].discounts;
  discont.classList.add(bsdom.system.tier.disc);
  if(discounts!=undefined){
    for(let i=0;i<discounts.length;i++){
      if(discounts[i].tiers[optnum]>0){
        discont.appendChild(document.createElement('div'));
        discont.lastChild.innerText = discounts[i].name + ': ' + discounts[i].tiers[optnum];
      }
    }
  }
  if(tquote.info.build.systems[sysnum].tiers[optnum].size){
    discont.appendChild(document.createElement('div'));
    discont.lastChild.innerText = `Ameren (${tquote.info.build.systems[sysnum].tiers[optnum].size.seer}): ${tquote.info.build.systems[sysnum].tiers[optnum].size.rebateelec != ''?tquote.info.build.systems[sysnum].tiers[optnum].size.rebateelec:0}`;
  
    discont.appendChild(document.createElement('div'));
    discont.lastChild.innerText = `Spire: ${tquote.info.build.systems[sysnum].tiers[optnum].size.rebategas!=''?tquote.info.build.systems[sysnum].tiers[optnum].size.rebategas:0}`;
  }
  return discont;
}

var POPsummary=(tquote,sysnum,popt,optnum,grp) => {
  let priceopt = tquote.info.pricing.systems[sysnum].tiers[optnum].priceops[popt];
  document.getElementById('financials-total').innerText = Math.trunc(priceopt.opts[grp.toLowerCase() + 'price'].price);
  document.getElementById('financials-manrebate').innerText = priceopt.payment.manrebate;
  document.getElementById('financials-lender').innerText = priceopt.payment.lender;
  $(document.getElementById('contract-cash')).replaceWith(document.getElementById('contract-cash').cloneNode(true));
  document.getElementById('contract-cash').addEventListener('click',(ele)=>{
    PRODUCEcontract(tquote,sysnum,popt,optnum,grp)
  });
}

var PRODUCEcontract=(tquote,sysnum,popt,optnum,grp)=>{
  if(chckcreatecontract){
      DropNote('tr','Creating Contract','green');
      ipcRenderer.send(quoteroutes.createcontract,{quote:tquote,contract:finalc.CREATEfinal(tquote,sysnum,popt,optnum,grp)});
      chckcreatecontract=false;
    }else{DropNote('tr','...Creating Contract','yellow')}
}

module.exports={
  INITbuildsum,
  ADDsumsystem,
  REFRESHsumsystem,
  GETsumsystems,
  bsdom,
  sumviews
}
