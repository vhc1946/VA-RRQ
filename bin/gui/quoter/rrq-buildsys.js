/* File to work with system selection module

    File is required in the rrq-quote.js file and uses some of the variables
    declared in said file.catch
    - vcontrol (view-controller.js)
    - ObjList (vg-list.js)
    - qsettings //quote settings from appset
    - tquote //the quote
    - qkey
    - qbuild
    - qprice

*/

var {SWAPdivorin}=require('../../repo/gui/js/tools/vg-displaytools.js');
var {SwapTable}=require('../forms/SwapFormList.js');
var ADJUSTdependents=(view)=>{

  //console.log('ADJUSTDING> ',view);
  //try{

    modbuild.modviews.REMOVEview(modbuild.modviews.FINDbutton(view.title));//vcontrol.REMOVEview(vcontrol.FINDbutton(view.title,document.getElementById(modbuild.moddom.cont)),document.getElementById(modbuild.moddom.cont));
    sumbuild.sumviews.REMOVEview(sumbuild.sumviews.FINDbutton(view.title));//vcontrol.REMOVEview(vcontrol.FINDbutton(view.title,document.getElementById(sumbuild.bsdom.cont)),document.getElementById(sumbuild.bsdom.cont));

    //pull system info and reconfig price
  //}catch{}
}

var sbdom = {
  cont:'build-systems-cont',
  add:{
    name:'build-system-add-name',
    button:'build-system-add-button'
  },
  system:{
    list:'build-systems',
    cont:'build-system',
    info:{
      cont:'build-system-info',
      btucooling:'build-system-coolbtus',
      btuheating:'build-system-heatbtus',
      areaserve:'build-system-areaserve',
      outlocation:'build-system-outlocation',
      inlocation:'build-system-inlocation',
      group:'build-system-group'
    },
    tier:{
      list:'build-system-tiers',
      cont:'build-system-tier',
      info:{
        name:'build-system-tier-name',
        system:'build-system-tier-system'
      },
      size:{
        list:'build-system-tier-sizes',
        cont:'build-system-tier-size',
        row:'build-system-tier-size-row',
        info:{

        }
      }
    }
  }
}

var currtier = null; //holds the tier selected when choosing sizes (holds element)

var syscont = document.getElementById(sbdom.cont);
var sysviews = new vcontrol.ViewGroup({ //selection views
  create:false,
  cont:document.getElementById(sbdom.cont),
  type:'mtl',
  delEve:ADJUSTdependents
});

/*Swap Table
  Declared in this file becuase it mostly deals with the system information. The
  way the file is structured, swaptable can be used in the functions. When the
  file is restructured it can be moved.

  Table is loaded first in the InitSysBuild()

*/
var Swaptable; //set in InitSysBuild()

var CreateSystemCard=(sysname,sys=null)=>{
  let newsys = document.getElementById(sbdom.system.cont).cloneNode(true); //system tab
  newsys.id='';
  newsys.classList.add(sbdom.system.cont);

  sysviews.ADDview(sysname,newsys,true);
  SetupSystemCard(newsys,sys); //setup as new system
  $(newsys).show();
}

/* Set up a System Selection Card
    PASS:
    - card - html template
    - qsys - system(s) object from quote
      quote.systems:[
        {
          tiers:{

          }
          accessories:[]
      ]
*/
var SetupSystemCard=(card,qsys=null)=>{
  let tierlist = card.getElementsByClassName(sbdom.system.tier.cont);
  for(let x=1;x<tierlist.length;x++){card.getElementsByClassName(sbdom.system.tier.list)[0].removeChild(tierlist[x]);} //clean tier list to include only one child
  for(let x=1;x<qsettings.tiers.length;x++){//add tiers to card
    let tele = card.getElementsByClassName(sbdom.system.tier.cont)[0].cloneNode(true);
    tele.getElementsByClassName(sbdom.system.tier.info.name)[0].innerText=qsettings.tiers[x].name;
    tele.addEventListener('click',(ele)=>{ //open size selector
      currtier = tele;
      let view = document.getElementsByClassName('min-page-cont')[0];
      $(view).show();
      view.getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML=currtier.getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML;
    });

    new MutationObserver(()=>{ //watch for a change in tier size
    }).observe(tele.getElementsByClassName(sbdom.system.tier.size.cont)[0],{subtree: true, childList: true});
    card.getElementsByClassName(sbdom.system.tier.list)[0].appendChild(tele);

  }

  card.getElementsByClassName(sbdom.system.tier.list)[0].setAttribute('style',`grid-template-columns:repeat(${qsettings.tiers.length-1},1fr)`); //adjust grid-template-columns

  if(qsys&&qsys.group!=''){
    card.getElementsByClassName('build-system-tiers-headers')[0].innerHTML = gentable.SETrowFROMobject(tquote.info.key.groups[qsys.group].optheads).innerHTML;
  };
  card.getElementsByClassName('build-system-tiers-headers')[0].addEventListener('click',(ele)=>{ //for editing the system tier size information
    let tiers = card.getElementsByClassName(sbdom.system.tier.cont);
    for(let x=0;x<tiers.length;x++){
      let tiersize = tiers[x].getElementsByClassName('build-system-tier-size')[0].children;

      for(let y=0;y<tiersize.length;y++){
        if(ele.target.title===tiersize[y].title){
          if(tiersize[y].children.length===0){//console.log('div');
            SWAPdivorin(tiersize[y],true);
          }
          else{
            SWAPdivorin(tiersize[y],false);
            for(let z=0,l=card.parentNode.children.length;z<l;z++){//refract the system tier change
              if(card.parentNode.children[z]===card){

                tquote.info.build = GETsystems();
                modbuild.GETbuildmod();
                tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
                console.log(tquote.info);
                sumbuild.REFRESHsumsystem(tquote.info.build.systems[z],z);  //y=sysid x=optid
              }
            }
          }
        }
      }
    }
  })

  card.getElementsByClassName(sbdom.system.tier.list)[0].removeChild(card.getElementsByClassName(sbdom.system.tier.cont)[0]);//clean tier list


  card.getElementsByClassName(sbdom.system.info.cont)[0].addEventListener('change',(ele)=>{ //update the system info filters
    let fltrs = {
      group:card.getElementsByClassName(sbdom.system.info.group)[0].value,
      btucooling:Number(card.getElementsByClassName(sbdom.system.info.btucooling)[0].value)||null,
    }
    if(tquote.info.key.groups[fltrs.group]){ //check for valid group
      tierlist = card.getElementsByClassName(sbdom.system.tier.cont);
      for(let x=0;x<tierlist.length;x++){ //loop through tiers
        let syslist = [];
        let sizelist = [];
        for(let y=0;y<tquote.info.key.groups[fltrs.group].systems.length;y++){ //find the systems tied to the tier
          if(qsettings.tiers[x+1].code == tquote.info.key.groups[fltrs.group].systems[y].info.tierid || tquote.info.key.groups[fltrs.group].systems[y].info.tierid =='T0'){
            syslist.push(tquote.info.key.groups[fltrs.group].systems[y]); //push systems that match the tier code
          }
        }
        card.getElementsByClassName(sbdom.system.tier.list)[0].children[x].getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML = ''; //clear size list

        let topts = [];
        for(let y=0;y<syslist.length;y++){
          if(y==0){
            card.getElementsByClassName(sbdom.system.tier.info.system)[x].innerHTML=gentable.SETrowFROMobject(syslist[y].info).innerHTML;
          }
          topts = topts.concat(syslist[y].opts);
        }
        topts.unshift(tquote.info.key.groups[fltrs.group].optheads);
        gentable.BUILDdistable(topts,card.getElementsByClassName(sbdom.system.tier.list)[0].children[x].getElementsByClassName(sbdom.system.tier.size.list)[0],true,sbdom.system.tier.size.row);
      }
    }else{DropNote('tr','Group Not found in Key','red',false)}
  });

  if(qsys&&qsys!=undefined){//is there a system to load into the template
    SETsystem(card,qsys);
  }
}

//temporary size finder
var CHECKsystemsize=(fltrs,sys)=>{
  for(let f in fltrs){
    switch(f){
      case 'btucooling':{
        if(fltrs[f] && fltrs[f]!=''){
          if(sys.btucooling>=fltrs[f] &&  fltrs[f]<=(sys.btucooling * .3 + sys.btucooling)){
            return true;
          }
        }else{return true}
      }
    }
  }
  return false;
}

// READING systems //////////////////////////////////////////////////////////////
var SETsystem=(card,sys)=>{
  card.getElementsByClassName(sbdom.system.info.group)[0].value = sys.group || '';
  card.getElementsByClassName(sbdom.system.info.areaserve)[0].value = sys.areaserve || '';
  card.getElementsByClassName(sbdom.system.info.btucooling)[0].value = sys.btucooling || '';
  card.getElementsByClassName(sbdom.system.info.btuheating)[0].value = sys.btuheating || '';
  card.getElementsByClassName(sbdom.system.info.outlocation)[0].value = sys.outlocation ||'';
  card.getElementsByClassName(sbdom.system.info.inlocation)[0].value = sys.inlocation || '';
  for(let x=0;x<sys.tiers.length;x++){
      try{
      card.getElementsByClassName(sbdom.system.tier.info.system)[x].innerHTML = gentable.SETrowFROMobject(sys.tiers[x].info).innerHTML;
      card.getElementsByClassName(sbdom.system.tier.list)[0].children[x].getElementsByClassName(sbdom.system.tier.size.cont)[0].innerHTML = gentable.SETrowFROMobject(sys.tiers[x].size).innerHTML;
      card.getElementsByClassName(sbdom.system.tier.list)[0].children[x].getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML = sys.tiers[x].sizes;
    }catch{}
  }
}

var GETsystems=()=>{
  var sysmodule = document.getElementById(sbdom.cont);
  syslist = sysmodule.getElementsByClassName(sbdom.system.cont);
  sysnames = (()=>{ //get the list of system names
    let sysmenu = sysmodule.children[0].children[0];
    let snames = [];
    for(let x=0;x<sysmenu.children.length;x++){
      snames.push(sysmenu.children[x].title);
    }
    return snames;
  })();
  systems = []; //holds all system data
  for(let x=0;x<sysnames.length;x++){
    systems.push({ //declaration of system object
      name:sysnames[x],
      group:syslist[x].getElementsByClassName(sbdom.system.info.group)[0].value,
      areaserve:syslist[x].getElementsByClassName(sbdom.system.info.areaserve)[0].value,
      btucooling:syslist[x].getElementsByClassName(sbdom.system.info.btucooling)[0].value,
      btuheating:syslist[x].getElementsByClassName(sbdom.system.info.btuheating)[0].value,
      outlocation:syslist[x].getElementsByClassName(sbdom.system.info.outlocation)[0].value,
      inlocation:syslist[x].getElementsByClassName(sbdom.system.info.inlocation)[0].value,
      additions:[],
      enhancments:[],
      tiers:[]
    });
    let tlist = syslist[x].getElementsByClassName(sbdom.system.tier.cont);

    for(let y=0;y<tlist.length;y++){ //loop through the systems tiers
      systems[x].tiers.push({ //declaration of system tier object
        name:tlist[y].getElementsByClassName(sbdom.system.tier.info.name)[0].innerText,
        info:gentable.GETrowTOobject(tlist[y].getElementsByClassName(sbdom.system.tier.info.system)[0]), //generic info for the system in the tier
        size: gentable.GETrowTOobject(tlist[y].getElementsByClassName(sbdom.system.tier.size.cont)[0]),
        sizes:tlist[y].getElementsByClassName(sbdom.system.tier.size.list)[0].innerHTML
      });
    }
  }

  let swaps = Swaptable.form;
  //console.log(swaps);
  /* Adjust Swaps
    [
      {
        system:'name',
        tier:'name',
        category:'name',
        swap:'model',
        swapto:'model',
        options:{
          system:(int)
          tier:(int)
          category:(prop name in system.tier.size)
          swapFROMprice:(swap price from acc table)
          swapTOprice:(swapto price from acc table)
        }
      }
    ]
  */
  for(let x=0;x<swaps.length;x++){
    let size = systems[swaps[x].options.system].tiers[swaps[x].options.tier].size;
    size[swaps[x].options.category]=swaps[x].swapto;

    //console.log(size.pricebase);
    size.pricebase = Number(size.pricebase) - (Number(swaps[x].options.swapFROMprice)-Number(swaps[x].options.swapTOprice)); //adjust the difference in price
    //console.log(size.pricebase);
  }
  //apply adjustments to system model numbers
  //adjust the base price for that swap
  return {systems,swaps};
}

/////////////////////////////////////////////////////////////////////////////////

// SETUP MODULE /////////////////////////////////////////////////////////////////

var InitSysBuild=()=>{
  //setup swap table
  Swaptable = new SwapTable({
    cont:document.getElementById('quote-swaptable'),
    info:tquote.info
  });
  for(let x=0;x<tquote.info.build.systems.length;x++){
    CreateSystemCard(tquote.info.build.systems[x].name,tquote.info.build.systems[x]);
  }
  //Observer for change of SwapTable
  const tableswap = Swaptable.table;
  const config = {childList:true}

  const swapTableChanged = (mutationlist, observer) => {
    for (const mutation of mutationlist) {
      if (mutation.type === 'childList') {
        //console.log('A child node has been added or removed.');
        tquote.info.build = GETsystems();
        modbuild.GETbuildmod();
        tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
        for(let x=0;x<tquote.info.build.systems.length;x++){
          sumbuild.REFRESHsumsystem(tquote.info.build.systems[x],x);  //y=sysid x=optid
        }
      }
    }
  }

  const tableobserver = new MutationObserver(swapTableChanged);
  tableobserver.observe(tableswap, config);
}

// modules

var CHECKforsystemname=(name)=>{
  if(tquote.info.build.systems!=undefined){
    for(let x=0;x<tquote.info.build.systems.length;x++){
      if(tquote.info.build.systems[x].name==name){return true}
    }
  }
  return false;
}

document.getElementById(sbdom.add.name).addEventListener('keypress',(eve)=>{
  if(eve.key == 'Enter'){document.getElementById(sbdom.add.button).click();};
});
document.getElementById(sbdom.add.button).addEventListener('click',(eve)=>{//add system to system list through build-system-add-button
  var sysname = document.getElementById(sbdom.add.name);
  if(sysname.value!=''&&!CHECKforsystemname(sysname.value)){ //OR make a current system name
    CreateSystemCard(sysname.value);
    tquote.info.build = GETsystems();
    tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);

    modbuild.modviews.ADDview(sysname.value,modbuild.ADDmodsystem(sysname),false);
    sumbuild.sumviews.ADDview(sysname.value,sumbuild.ADDsumsystem(tquote.info.build.systems.length-1,tquote.info.build.systems[tquote.info.build.systems.length-1]),false);
  }else{DropNote('tr','Bad System Name','red')}
  sysname.value = '';
});

// SETUP SYSTEM SIZE SELECTOR ////////////////////////
document.getElementsByClassName('min-page-hide-button')[0].addEventListener('click',(ele)=>{
  $(document.getElementsByClassName('min-page-cont')[0]).hide();
});

var SELECTsystemsize = (ele)=>{
  if(ele.target.parentNode.classList.contains(sbdom.system.tier.size.row)){
    currtier.getElementsByClassName(sbdom.system.tier.size.cont)[0].innerHTML = ele.target.parentNode.innerHTML;

    let syscard = currtier.parentNode.parentNode.parentNode;
    let grpname =  syscard.getElementsByClassName(sbdom.system.info.group)[0].value;
    let sysid = gentable.GETrowTOobject(ele.target.parentNode).sysid;
    let sysname = currtier.parentNode.parentNode.title;
    let sysinfo = FINDsystem(grpname,sysid);
    if(sysinfo){
      currtier.getElementsByClassName(sbdom.system.tier.info.system)[0].innerHTML = gentable.SETrowFROMobject(sysinfo).innerHTML;
      for(let y=0;y<syscard.parentNode.children.length;y++){
        if(syscard.parentNode.children[y] == syscard){//find the index of the system
          for(let x=0;x<currtier.parentNode.children.length;x++){
            if(currtier.parentNode.children[x]==currtier){ //find the index of the tier
              modbuild.UPDATEenhlist(sysinfo,y,x);
              modbuild.UPDATEdscntlist(sysinfo,y,x);
              tquote.info.build = GETsystems();
              modbuild.GETbuildmod();
              tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
              sumbuild.REFRESHsumsystem(tquote.info.build.systems[y],y);  //y=sysid x=optid
            }
          }
        }
      }

      syscard.getElementsByClassName('build-system-tiers-headers')[0].innerHTML = gentable.SETrowFROMobject(tquote.info.key.groups[grpname].optheads).innerHTML;
      //put headers
    }
  }
}

document.getElementsByClassName('min-page-view')[0].getElementsByClassName(sbdom.system.tier.size.list)[0].addEventListener('click',SELECTsystemsize);

//  Private KEY functions ////////////////////////////

/* FINDs a System in the key
    PASS:
    - grp - group name
    - sysid - system id
*/
var FINDsystem = (grp,sysid)=>{
  if(tquote.info.key.groups[grp]!=undefined){
    for(let x=0;x<tquote.info.key.groups[grp].systems.length;x++){
      if(tquote.info.key.groups[grp].systems[x].info.sysid == sysid){
        return tquote.info.key.groups[grp].systems[x].info;
      }
    }
  }
  return null;
}

var UPDATEsystemtier = (syscard)=>{
  let grpname =  syscard.getElementsByClassName(sbdom.system.info.group)[0].value;
  let sysid = gentable.GETrowTOobject(ele.target.parentNode).sysid;
  let sysname = currtier.parentNode.parentNode.title;

  if(sysinfo){
    for(let y=0;y<syscard.parentNode.children.length;y++){
      if(syscard.parentNode.children[y] == syscard){//find the index of the system
        for(let x=0;x<currtier.parentNode.children.length;x++){
          if(currtier.parentNode.children[x]==currtier){ //find the index of the tier
            modbuild.UPDATEenhlist(sysinfo,y,x);
            modbuild.UPDATEdscntlist(sysinfo,y,x);
            tquote.info.build = GETsystems();
            tquote.info.pricing.systems = pricer.GETsystemprices(qsettings,tquote.info.build);
            modbuild.GETbuildmod();
            sumbuild.REFRESHsumsystem(tquote.info.build.systems[y],y);  //y=sysid x=optid
          }
        }
      }
    }
    syscard.getElementsByClassName('build-system-tiers-headers')[0].innerHTML = gentable.SETrowFROMobject(tquote.info.key.groups[grpname].optheads).innerHTML;
  }
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
module.exports={
  InitSysBuild,
  GETsystems,
  modbuild,
  sumbuild,
  sbdom
}
