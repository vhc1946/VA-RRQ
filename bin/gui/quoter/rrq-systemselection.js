var {VHCforms}=require('../../repo/tools/box/vhc-forms.js');

class SystemSelection extends VHCforms{
  constructor(cont){
    super(cont);
    let newsys = document.getElementById(sbdom.system.cont).cloneNode(true); //system tab
    newsys.id='';
    newsys.classList.add(sbdom.system.cont);

    sysviews.ADDview(sysname,newsys,true);
    SetupSystemCard(newsys,sys); //setup as new system
    $(newsys).show();
  }

  CreateSystemCard(sysname,sys=null){
    let newsys = document.getElementById(sbdom.system.cont).cloneNode(true); //system tab
    newsys.id='';
    newsys.classList.add(sbdom.system.cont);

    sysviews.ADDview(sysname,newsys,true);
    SetupSystemCard(newsys,sys); //setup as new system
    $(newsys).show();
  }

  GETselections(){}
  SETselections(){}

}
