/* GET all the system price
    Takes the qbuild and creates pricing for each system
    An array is returned and attached to the quote.info.pricing.systems object
*/

var dbldip={
  carrier: false,
  daikin: true,
  payne: false,
  other: false
}

var GETsystemprices=(qsets,qbuild)=>{
  let tempfintable=require('./tempfintable.json');//read in temp json file here
  console.log(tempfintable);
  //tempfintable
  let sparr = [];
  for(let x=0;x<qbuild.systems.length;x++){
    let sobj = {
      name:qbuild.systems[x].name,
      tiers:[]
    }
    for(let y=0;y<qbuild.systems[x].tiers.length;y++){//loop through available tiers
      let tobj = {
        cost:0,

        addbefore:GETaddprice(y,qbuild.systems[x].additions),
        minbefore:qbuild.system[x].info.rebateelec+qbuild.system[x].info.discmfg,

        addafter:GETaddprice(y,qbuild.systems[x].additions),
        minafter:0,

        priceops:[]
      }
      for(let z=1;z<qsets.finance.length;z++){//loop through payment plans in order
        try{
          tobj.priceops.push(
            GETsizeprice(tobj,
                         qbuild.systems[x].tiers[y],
                         qbuild.systems[x].discounts,
                         y,
                         qsets.finance[z])
          );
        }catch{}
      }
      sobj.tiers.push(tobj);
    }
    sparr.push(sobj);
  }
  return sparr;
}

var GETaddprice=(tnum,alist)=>{
  let aprice = 0;
  if(alist!=undefined){
    for(let x=0;x<alist.length;x++){
      if(alist[x].tiers[tnum]>0){aprice+=(Number(alist[x]['price_sale'])*Number(alist[x].tiers[tnum]))}
    }
  }
  return aprice;
}

var GETdscntstotal=(tnum,dlist,price,rebate=0)=>{
  let dprice = 0;
  if(dlist!=undefined){
    for(let x=0;x<dlist.length;x++){
      if(Number(dlist[x].tiers[tnum])>=1){dprice+=Number(dlist[x].tiers[tnum])}
      else{
        dprice+=(price*Number(dlist[x].tiers[tnum]));
      }
    }
  }
  return dprice+rebate;
}

//bring in size info
//bring in tier info
var RUNpricecalc=(price,fincost,ab,mb,aa,ma)=>{
  price = Number(price);
  fincost = Number(fincost);
  console.log(price,fincost,adds, disc)
  return (price+ab-mb)/(1-fincost)+aa-ma;
  //return ((price+adds)/(1-fincost))-disc;
}

var GETmonthlyfin=(price,payment)=>{
  if(payment.rate&&payment.rate!=undefined){
    if(payment.rate>=1){return price/payment.rate;}
    else{return price*payment.rate;}
  }else{return 0;}
}

var GETsizeprice=(tinfo,size,discounts,tiernum,payment)=>{

  let tpobj = {
    payment:payment,
    opts:{
      sysprice:{
        price:RUNpricecalc(size.size.pricebase,payment.cost,tinfo.addprice),
        monthly:0
      },
      inprice:{
        price:RUNpricecalc(size.size.priceindoor,payment.cost,tinfo.addprice),
        monthly:0
      },
      outprice:{
        price:RUNpricecalc(size.size.priceoutdoor,payment.cost,tinfo.addprice),
        monthly:0
      }
    }
  }
  let partdisc = [];
  if(discounts){
    for(let x=0;x<discounts.length;x++){
      if(discounts[x].ref!='discmfg'){partdisc.push(discounts[x])}
    }
  }
  for(let po in tpobj.opts){ //loop through to apply discounts
    tpobj.opts[po].price = tpobj.opts[po].price-GETdscntstotal(
      tiernum,
      po=='sysprice'?discounts:partdisc,
      tpobj.opts[po].price,
      po=='sysprice'?Number(size.size.rebateelec):0
    );
    tpobj.opts[po].monthly=GETmonthlyfin(tpobj.opts[po].price,payment); //calculate monthly after discounts
  }
  console.log('Size',size);
  console.log('Price',tpobj);
  return tpobj;
}

module.exports={
  GETsystemprices
}
