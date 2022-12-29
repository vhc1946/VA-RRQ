/* File to work with system selection module

    File is required in the rrq-quote.js file and uses some of the variables
    declared in said file.catch
    - ObjList (vg-list.js)
    - gentable
    - qsettings //quote settings from appset for tiers
    - tquote //the quote
    - qkey

*/
var {SETdatalistSPC, FINDparentele}=require('../../repo/gui/js/tools/vg-displaytools.js');


var moddom = {
  cont:'build-mod-cont',
  selected:'vg-subtab-selected',
  nav:{
    mods:'build-mod-adds-button',
    iaq:'build-mod-iaq-button',
    dscnts:'build-mod-dscnts-button'
  },
  system:{
    cont:'build-mod-system'
  },
  views:{
    mods:{
      cont:'build-mod-cont',
      selected:'build-mod-selected',
      adds:{
        selects:'build-mod-add-selects'
      },
      enh:{
        selects:'build-mod-enh-selects'
      },
      fltrs:{
        cats:'',
        item:'',
      },
      form:{
        addin:'build-mod-add-in',
        addbutton:'build-mod-add-inbutton',
      },
      seltitle:{
        cont:'build-mod-add-titles',
        tiers:'build-mod-add-title-tiers',
        prices:'build-mod-add-title-prices'
      },
      selline:{
        cont:'build-mod-add-line',
        tiers:'build-mod-add-tiers',
        priceselect:'build-mod-price-select',
        prices:'build-mod-add-prices'
      },
      list:'build-mod-add-list',
      listrow:'acc-row'
    },
    iaq:{
      cont:'build-iaq-cont'
    },
    dscnts:{
      cont:'build-dscnts-cont',
      title:{
        cont:'build-dscnts-titles',
        tiers:'build-dscnts-tiers'
      },
      list:'build-dscnts-list',
      stable:'build-swap-table'
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

var SETUPmodviewer=()=>{
  for(let n in moddom.nav){
    document.getElementById(moddom.nav[n]).addEventListener('click',(ele)=>{
      RESETmodviewer();
      let views = document.getElementsByClassName(moddom.views[n].cont);
      ele.target.classList.add(moddom.selected);
      console.log(views);
      console.log(views);
      for(let x=0;x<views.length;x++){

        $(views[x]).show();
      }
    });
  }
}
var RESETmodviewer=()=>{
  for(let n in moddom.nav){
    document.getElementById(moddom.nav[n]).classList.remove(moddom.selected);
    let views = document.getElementsByClassName(moddom.views[n].cont);
    for(let x=0;x<views.length;x++){$(views[x]).hide()}
  }
}


SETUPmodviewer();

// ADD-ONs /////////////////////////////////////////////////////////////////////
var modlist; //modifications list
var modlisthead; //modifications header

//var modcont = document.getElementById(moddom.cont);
var modviews = new vcontrol.ViewGroup({
  create:false,
  cont:document.getElementById(moddom.cont),
  type:'mtl'
})
console.log('BUILD',tquote);

var INITbuildmod=()=>{
  modlist = new ObjList([...tquote.info.key.accessories]); //copy the accessories array
  modlisthead = modlist.GETlist().shift();

  for(let x=0;x<tquote.info.build.systems.length;x++){
    modviews.ADDview(tquote.info.build.systems[x].name,ADDmodsystem(tquote.info.build.systems[x].name,tquote.info.build.systems[x]));
  }
}

var GETbuildmod=()=>{
  let cont = document.getElementById('build-mod-views').getElementsByClassName('build-mod-system');
  for(let x=0;x<cont.length;x++){ //loop through systems
    let list = cont[x].getElementsByClassName(moddom.views.mods.enh.selects)[0].children;
    tquote.info.build.systems[x].enhancments=[];
    //enhancements
    for(let y=1;y<list.length;y++){
      tquote.info.build.systems[x].enhancments.push(GETselectline(list[y]));
    }
    //additions
    list = cont[x].getElementsByClassName(moddom.views.mods.adds.selects)[0].children;
    tquote.info.build.systems[x].additions=[];
    for(let y=1;y<list.length;y++){
      tquote.info.build.systems[x].additions.push(GETselectline(list[y]));
    }
    //iaq
    //Discounts
    list = cont[x].getElementsByClassName(moddom.views.dscnts.list)[0].children;
    tquote.info.build.systems[x].discounts=[];
    for(let y=0;y<list.length;y++){
      tquote.info.build.systems[x].discounts.push(GETdscntline(list[y]));
    }
  }
}

var ADDmodsystem=(sname,sys=undefined)=>{
  let modsys = document.getElementById('build-mod-system').cloneNode(true);
  modsys.id = '';
  modsys.classList.add('build-mod-system');

  $(modsys).show();

  SETaddblock(modsys.getElementsByClassName(moddom.views.mods.cont)[0],sys);
  SETdscntblock(modsys.getElementsByClassName(moddom.views.dscnts.cont)[0],sys);//Setup Discount Block

  modsys.getElementsByClassName(moddom.views.mods.form.addbutton)[0].addEventListener('dblclick',(ele)=>{
    let value = modsys.getElementsByClassName(modbuild.moddom.views.mods.form.addin)[0].value;
    if(value!=''){
      modsys.getElementsByClassName(moddom.views.mods.adds.selects)[0].appendChild(ADDselectline({
        name:value,
        notes:'',
        enhance:'',
        tiers:['','','',''],
        price_sale:0
      }))
      modsys.getElementsByClassName(modbuild.moddom.views.mods.form.addin)[0].value = '';

      document.getElementById(moddom.cont).dispatchEvent(new Event('change')); //to refersh the quote
    }
  })
  return modsys;
}

var Dupcheck=(modsys, lrow)=>{ //Checks for duplicates in mods table before adding
  let modcont = modsys.getElementsByClassName(moddom.views.mods.adds.selects)[0];
    for(let x=0;x<modcont.children.length;x++){
      if(modsys.getElementsByClassName(moddom.views.mods.adds.selects)[0].children[x].innerHTML == lrow.innerHTML){
        return false;
      }
    }
  return true;
}

// Accessories / Enhancements //////////////////////////////////////////////////

var SETaddblock=(block,sys=undefined)=>{
  //setup additions
  let titleele = block.getElementsByClassName(moddom.views.mods.seltitle.tiers)[0];
  for(let x=1;x<qsettings.tiers.length;x++){
    titleele.appendChild(document.createElement('div'));
    titleele.lastChild.innerText = qsettings.tiers[x].name;
  }
  titleele = block.getElementsByClassName(moddom.views.mods.seltitle.prices)[0];
  titleele.appendChild(document.createElement('div'));
  titleele.lastChild.innerText = tquote.info.key.accessories[0]['price_sale']; //Title value for dedection price
 
  SETenhlist(block,modlist.TRIMlist({}),sys);
  SETaddlist(block,sys);


  SETdatalistSPC(modlist.list,{cat:'mod-add-cat-list'});
  SETaccfilters(block);

  SETacclist(block,modlist.list); //exclude enhancements

  block.getElementsByClassName(moddom.views.mods.list)[0].addEventListener('click',(ele)=>{ // Add to selects from list
    let lrow = FINDparentele(ele.target,'acc-row');
    lrow=ADDselectline(gentable.GETrowTOobject(lrow)); //get row to compare
    if(Dupcheck(block,lrow)){//check to see if item has been added
      block.getElementsByClassName(moddom.views.mods.adds.selects)[0].appendChild(lrow);
    }else{
      DropNote('tr','Already on List','yellow');
    }

    document.getElementById(moddom.cont).dispatchEvent(new Event('change')); //to refresh quote
  });

  // Marks items for deletion
  block.getElementsByClassName(moddom.views.mods.adds.selects)[0].addEventListener('click',(ele)=>{
    let clicked = ele.target.parentNode;
    if(clicked.classList.contains(moddom.views.mods.selline.cont)){
      if(clicked.classList.contains('mod-to-delete')){
        clicked.classList.remove('mod-to-delete');
      }else{
        clicked.classList.add('mod-to-delete');
      }
    };
  });

  // Deletes selected items on button click, works from bottom of list up
  block.getElementsByClassName('build-mod-add-delete')[0].addEventListener('click',(ele)=>{
    let modcont = block.getElementsByClassName(moddom.views.mods.adds.selects)[0];
    for(let x=modcont.children.length-1;x>0;x--){
      if(modcont.children[x].classList.contains('mod-to-delete')){
        modcont.removeChild(modcont.children[x]);
      }
    }
    document.getElementById(moddom.cont).dispatchEvent(new Event('change')); //to refersh the quote
  });

  //Show & Hide Modifications table
  block.getElementsByClassName('modslist-show')[0].addEventListener('click',(ele)=>{
    $(block.getElementsByClassName('min-page-cont-mods')[0]).show();
  });
  block.getElementsByClassName('min-page-hide-button')[0].addEventListener('click',(ele)=>{
    $(block.getElementsByClassName('min-page-cont-mods')[0]).hide();
  });
}

/*Setup the enhancements for a system*/
var SETenhlist=(cont,list,sys=undefined)=>{
  let start=1;
  if(sys!=undefined && sys.enhancments!=undefined && sys.enhancments.length>0){
    start=0;
    list=sys.enhancments;
  }
  for(let x=start;x<list.length;x++){
    if(list[x].enhance!=''){
      cont.getElementsByClassName(moddom.views.mods.enh.selects)[0].appendChild(ADDselectline(list[x],true));
    }
  }
}

/*Setup the additions for a system*/
var SETaddlist=(cont,sys=undefined)=>{
  if(sys!=undefined && sys.additions!=undefined){
    for(let x=0;x<sys.additions.length;x++){
      cont.getElementsByClassName(moddom.views.mods.adds.selects)[0].appendChild(ADDselectline(sys.additions[x],false));
    }
  }
}

/* Adds a modification to ADDs and DEDs
    PASS:
    - aobj - object to load to line
*/
var ADDselectline=(aobj,enhance)=>{
  console.log(aobj);
  let row = document.createElement('div');
  row.classList.add(moddom.views.mods.selline.cont);

  row.appendChild(document.createElement('div'));
  row.lastChild.innerText = aobj.name || '',
  row.lastChild.title = aobj.notes;
  row.appendChild(document.createElement('div'));
  row.lastChild.innerText = aobj.enhance;
  $(row.lastChild).hide();
  
  row.appendChild(document.createElement('div'));
  row.lastChild.innerText = aobj.cat;
  $(row.lastChild).hide();

  row.appendChild(document.createElement('div')); //create tiers container
  row.lastChild.classList.add(moddom.views.mods.selline.tiers);
  if(enhance){
    for(let x=1;x<qsettings.tiers.length;x++){
      row.lastChild.appendChild(CREATEtogglebox(row));
    }
  }else{
    for(let x=1;x<qsettings.tiers.length;x++){
      row.lastChild.appendChild(document.createElement('input'));
      if(aobj.tiers!=undefined){
        row.lastChild.lastChild.value=aobj.tiers[x-1]!=undefined?aobj.tiers[x-1]:1;
      }else{
        row.lastChild.lastChild.value=1;
      }
      row.lastChild.lastChild.type='number';
      if(aobj.qnty){//set type number
      }else{//set type check
      }
    }
  }
  row.appendChild(document.createElement('div'));
  row.lastChild.classList.add(moddom.views.mods.selline.prices);

  row.lastChild.appendChild(document.createElement('input'));
  row.lastChild.lastChild.type='number';
  row.lastChild.lastChild.value = aobj['price_sale']!=undefined && aobj['price_sale']!=''?aobj['price_sale']:0;
  
  row.lastChild.appendChild(document.createElement('input'));
  row.lastChild.lastChild.type='number';
  row.lastChild.lastChild.value = aobj['price-deduct']!=undefined && aobj['price-deduct']!=''?aobj['price-deduct']:0;
  $(row.lastChild.lastChild).hide();

  return row;
}


/////////////////////////////////////////////////////////////////////////////////
/*

*/
let togglestates={
  no:'vg-togglebox-left',
  yes:'vg-togglebox-right',
  neutral:'vg-togglebox-center'
}

var CREATEtogglebox=(cont)=>{
  let togglebox = cont.lastChild.appendChild(document.createElement('div'));
    togglebox.classList.add('vg-togglebox-center');
    togglebox.appendChild(document.createElement('div'))
    togglebox.lastChild.addEventListener('click',(ele)=>{
      RESETtoggle(togglebox);
      togglebox.classList.add('vg-togglebox-left')
    });
    togglebox.appendChild(document.createElement('div'));
    togglebox.lastChild.addEventListener('click',(ele)=>{
      RESETtoggle(togglebox);
      togglebox.classList.add('vg-togglebox-center')
    });
    togglebox.appendChild(document.createElement('div'));
    togglebox.lastChild.addEventListener('click',(ele)=>{
      RESETtoggle(togglebox);
      togglebox.classList.add('vg-togglebox-right')
    });


  return togglebox;
}

var RESETtoggle=(cont)=>{
  let list = cont.classList;
  for(let i=0;i<list.length;i++){
    cont.classList.remove(list[i]);
  }
}
/////////////////////////////////////////////////////////////////////////////////

var GETselectline=(aline)=>{
  console.log(aline);
  let aobj = {};
  aobj.name = aline.children[0].innerText;
  aobj.notes = aline.children[0].title;
  aobj.enhance = aline.children[1].innerText;
  aobj.cat = aline.children[2].innerText;
  let ele = aline.children[3].children;
  aobj.tiers=[];
  for(let x=0;x<ele.length;x++){
    aobj.tiers.push(ele[x].value);
  }
  ele = aline.children[4].children;
  aobj['price_sale']=ele[0].value;
  aobj['price-deduct']=ele[1].value;

  return aobj;
}

/* UPDATE the enhance list
    PASS:
    - sysinfo - system info from key
    - sysnum - array index for system
    - tiernum - array index for tier

*/
var UPDATEenhlist=(sysinfo,sysnum,tiernum)=>{
  let syscont = document.getElementById(moddom.cont).getElementsByClassName(moddom.system.cont);
  let enlist = syscont[sysnum].getElementsByClassName(moddom.views.mods.enh.selects)[0].children;
  for(let x=1;x<enlist.length;x++){
    let val=0;
    if(sysinfo[enlist[x].children[1].innerText]!=0){val=1;}
    enlist[x].getElementsByClassName(moddom.views.mods.selline.tiers)[0].children[tiernum].value = val;
  }
}

// Accessory Selection List ////////////////////////////////////////////////////

var accfilterrow = null;
var SETaccfilters=(cont)=>{
  cont.getElementsByClassName('min-page-menu')[0].appendChild(gentable.SETrowFROMobject({name:'',notes:'',cat:''},true));
  accfilterrow = cont.getElementsByClassName('min-page-menu')[0].lastChild;
  accfilterrow.classList.add(moddom.views.mods.listrow);
  accfilterrow.children[2].setAttribute('type','search');
  accfilterrow.children[2].setAttribute('list','mod-add-cat-list');
  accfilterrow.children[2].setAttribute('placeholder','Select Category');
  accfilterrow.children[0].setAttribute('placeholder','Search Item');
  accfilterrow.addEventListener('change',(ele)=>{
    let flts = gentable.GETrowTOobject(cont.getElementsByClassName('min-page-menu')[0].lastChild,true);
    SETacclist(cont,modlist.TRIMlist(flts,true));
  });
}
/* Sets the accessories list
    used for selection both ADDs and DEDs
*/
var SETacclist=(cont,alist)=>{
  let list = cont.getElementsByClassName(moddom.views.mods.list)[0];
  let tlist = [];
  gentable.BUILDtruetable(tlist.concat(modlisthead,alist),list,true,moddom.views.mods.listrow);
}

//setup up filter input
//load accessories to ObjectList
//change event for filtering TRIMlist(filter)

// Discounts ///////////////////////////////////////////////////////////////////

var defdscnt = {
  discinstnt:'Instant Discount',
  discmfg:'Manufacture Discount',
  discspcl:'Special Discount'
}

var wpdscnts={
  multisys:{
    id:'build-dscnts-multisys',
    title:'Multi-System Discount',
    value:.05
  },
  frndsfam:{
    id:'build-dscnts-frndsfam',
    title:'Friends & Family Discount',
    value:.1
  },
  noremorse:{
    id:'build-dscnts-noremorse',
    title:'No Remorse Discount',
    value:300
  }
}

var UPDATEwpdscnts = (wpdscnt,add=true)=>{
  let syscont = document.getElementById(moddom.cont).getElementsByClassName(moddom.system.cont);
  let found = false;
  for(let x=0;x<syscont.length;x++){
    let dblist = syscont[x].getElementsByClassName(moddom.views.dscnts.list)[0].children;
    for(let y=0;y<dblist.length;y++){
      if(dblist[y].children[0].value==wpdscnt.name){
        dblist[0].parentNode.removeChild(dblist[y]);
        if(add){dblist[0].parentNode.insertAfter(ADDdscntline(wpdscnt),dblist[y]);added=true;}
        found = true;
      }
    }
    if(!found){dblist[0].parentNode.appendChild(ADDdscntline(wpdscnt));}
  }
}
var GETwpdscntinfo = (wpname)=>{
  return {
    name:wpdscnts[wpname].title,
    ref:wpname,
    tiers:[
      wpdscnts[wpname].value,
      wpdscnts[wpname].value,
      wpdscnts[wpname].value,
      wpdscnts[wpname].value,
    ],
    type:wpdscnts[wpname].type
  }
}

// Discount Actions //
document.getElementById(wpdscnts.multisys.id).addEventListener('click',(ele)=>{
  let toadd=false;
  if(ele.target.classList.contains('vg-checkbox-checked')){console.log('delete');ele.target.classList.remove('vg-checkbox-checked');}
  else{console.log('adding');ele.target.classList.add('vg-checkbox-checked');toadd=true;}

  UPDATEwpdscnts(GETwpdscntinfo('multisys'),toadd);
  document.getElementById(moddom.cont).dispatchEvent(new Event('change'));
});
document.getElementById(wpdscnts.frndsfam.id).addEventListener('click',(ele)=>{
  let toadd=false;
  if(ele.target.classList.contains('vg-checkbox-checked')){ele.target.classList.remove('vg-checkbox-checked');}
  else{ele.target.classList.add('vg-checkbox-checked');toadd=true;}
  UPDATEwpdscnts(GETwpdscntinfo('frndsfam'),toadd);
  document.getElementById(moddom.cont).dispatchEvent(new Event('change'));
});
document.getElementById(wpdscnts.noremorse.id).addEventListener('click',(ele)=>{
  let toadd=false;
  if(ele.target.classList.contains('vg-checkbox-checked')){ele.target.classList.remove('vg-checkbox-checked');}
  else{ele.target.classList.add('vg-checkbox-checked');toadd=true;}
  UPDATEwpdscnts(GETwpdscntinfo('noremorse'),toadd);
  document.getElementById(moddom.cont).dispatchEvent(new Event('change'));
});


//////////////////////////////

/* Create Discount Block for system
    PASS:
    - block: system discount container
    - dscnts: list of system discounts
*/
var SETdscntblock=(block,sys=undefined)=>{
  let list = block.getElementsByClassName(moddom.views.dscnts.list)[0];
  for(let x=1;x<qsettings.tiers.length;x++){ //Setup title
    block.getElementsByClassName(moddom.views.dscnts.title.tiers)[0].appendChild(document.createElement('div'))
    block.getElementsByClassName(moddom.views.dscnts.title.tiers)[0].lastChild.innerText = qsettings.tiers[x].name;
  }
  if(sys!=undefined&&sys.discounts!=undefined){//Add discounts from quote
    for(let x=0;x<sys.discounts.length;x++){
      list.appendChild(ADDdscntline(sys.discounts[x]));
      if(wpdscnts[sys.discounts[x].ref]!=undefined){ //initialize whole project discounts
        document.getElementById(wpdscnts[sys.discounts[x].ref].id).classList.add('vg-checkbox-checked');
      }
    }
  }else{//initialize new discounts
    for(let d in defdscnt){
      let defd = {
        name:defdscnt[d],
        ref:d,
        tiers:[]
      }
      for(let x=0;x<qsettings.tiers.length;x++){defd.tiers.push(0)}
      list.appendChild(ADDdscntline(defd));
    }
  }
  SETswaptable(block);
}
var SETswaptable=(block)=>{
  let stable = block.getElementsByClassName(moddom.views.dscnts.stable)[0];
  stable.appendChild(document.createElement('div'));

}


var ADDdscntline=(dobj)=>{
  let row = document.createElement('div');
  row.classList.add(moddom.views.mods.selline.cont);

  row.appendChild(document.createElement('input'));//Name of discount
  row.lastChild.value = dobj.name || '',

  row.appendChild(document.createElement('div'));//system reference
  row.lastChild.innerText = dobj.ref|| '',
  $(row.lastChild).hide();
  row.appendChild(document.createElement('div'));//tier container
  row.lastChild.classList.add(moddom.views.mods.selline.tiers);

  for(let x=1;x<qsettings.tiers.length;x++){
    row.lastChild.appendChild(document.createElement('input'));
    if(dobj.tiers!=undefined){
      row.lastChild.lastChild.value=dobj.tiers[x-1]!=undefined?dobj.tiers[x-1]:0;
    }
    row.lastChild.lastChild.type='number';
  }
  return row
}

var GETdscntline=(aline)=>{
  var dobj = {
    name:aline.children[0].value,
    ref:aline.children[1].innerText,
    tiers:[]
  }
  for(let x=0;x<aline.children[2].children.length;x++){
    dobj.tiers.push(aline.children[2].children[x].value);
  }
  return dobj;
}

/* UPDATE the discount list
    PASS:
    - sysinfo - system info from key
    - sysnum - array index for system
    - tiernum - array index for tier
*/
var UPDATEdscntlist=(sysinfo,sysnum,tiernum)=>{
  let syscont = document.getElementById(moddom.cont).getElementsByClassName(moddom.system.cont);
  let dlist = syscont[sysnum].getElementsByClassName(moddom.views.dscnts.list)[0].children;
  for(let x=0;x<dlist.length;x++){
    if(sysinfo[dlist[x].children[1].innerText]!=undefined){dlist[x].children[2].children[tiernum].value = sysinfo[dlist[x].children[1].innerText];}
  }
}

////////////////////////////////////////////////////////////////////////////////

var Priceselection=(tobj)=>{
  let tarprice = tobj.target;
  if(!tarprice.classList.contains(moddom.views.mods.selline.prices)){
    for(x=0;x<tarprice.parentNode.children.length;x++){
      tarprice.parentNode.children[x].classList.remove(moddom.views.mods.selline.priceselect);
    }
    tarprice.classList.add(moddom.views.mods.selline.priceselect);
  };
}

module.exports = {
  INITbuildmod,
  ADDmodsystem,
  GETbuildmod,
  UPDATEenhlist,
  UPDATEdscntlist,
  moddom,
  modviews
}
