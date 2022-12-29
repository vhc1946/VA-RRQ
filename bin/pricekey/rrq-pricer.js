/* GET all the system price
    Takes the qbuild and creates pricing for each system
    An array is returned and attached to the quote.info.pricing.systems object
*/

var GETsystemprices=(qsets,qbuild)=>{
  //let tempfintable=require('./tempfintable.json');//read in temp json file here

  let sparr = [];
  for(let x=0;x<qbuild.systems.length;x++){
    let sobj = {
      name:qbuild.systems[x].name,
      tiers:[]
    }
    for(let y=0;y<qbuild.systems[x].tiers.length;y++){  // loop through available tiers
      if(qbuild.systems[x].tiers[y].size != null){
        let tobj = {
          cost:0,
          addbefore:GETaddprice(y,qbuild.systems[x].additions),
          minbefore:0,
          addafter:GETiaqprice(y,qbuild.systems[x].additions),
          minafter:0,
          priceops:[]
        }
        for(let z=1;z<qsets.finance.length;z++){  // loop through payment plans in order
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
  }
  console.log(sparr);
  return sparr;
}

var GETaddprice=(tnum,alist)=>{
  let addprice = 0;  // Accessory items
  if(alist!=undefined){
    for(let x=0;x<alist.length;x++){
      if(alist[x].tiers[tnum]>0){
        addprice+=(Number(alist[x]['price_sale'])*Number(alist[x].tiers[tnum]))
      }
    }
  }
  return addprice;
}
var GETiaqprice=(tnum,alist)=>{
 return 0;
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

var RUNpricecalc=(price,fincost,tinfo)=>{
  return (Number(price)+tinfo.addbefore-tinfo.minbefore)/(1-Number(fincost))+tinfo.addafter-tinfo.minafter;
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
        price:size.size.pricebase,
        monthly:0
      },
      inprice:{
        price:size.size.priceindoor,
        monthly:0
      },
      outprice:{
        price:size.size.priceoutdoor,
        monthly:0
      }
    }
  }
  let partdisc = [];
  if(discounts){
    for(let x=0;x<discounts.length;x++){
      if(discounts[x].ref!='discmfg'){
        if(discounts[x].ref!='discinstnt'){  // Cut Instant discount in half for partial
          partdisc.push(discounts[x]);
        }else{  
          partdisc.push({
            name:discounts[x].name,
            ref:discounts[x].ref,
            tiers:{
              0:discounts[x].tiers[0]/2,
              1:discounts[x].tiers[1]/2,
              2:discounts[x].tiers[2]/2,
              3:discounts[x].tiers[3]/2
            }
          });
        }
      }
    }
  }
  for(let po in tpobj.opts){ //loop through to apply discounts
    tinfo.minbefore = GETdscntstotal(
      tiernum,
      po=='sysprice'?discounts:partdisc,
      tpobj.opts[po].price,
      po=='sysprice'?Number(size.size.rebateelec):0
    );
    tpobj.opts[po].price = RUNpricecalc(tpobj.opts[po].price,payment.cost,tinfo);
    tpobj.opts[po].monthly = GETmonthlyfin(tpobj.opts[po].price,payment); //calculate monthly after discounts
  }
  //console.log('Size',size);
  console.log('Price',tpobj);
  return tpobj;
}

module.exports={
  GETsystemprices
}
