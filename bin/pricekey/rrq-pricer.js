/* RRQ Pricing formulas

  GETsystemprices is the only public method and requires the programs quote
  settings and the quote build. The result will be an array holding system
  price options:[
    ...,

    {
      name:'',
      tiers:[
        {
          cost:0,
          addbefore:0,
          minbefore:0,
          addafter:0,
          minafter:0,
          priceops:[]
        },
        ...
      ]
    },

    ...,
  ]

*/


/* GET all the system price
    Takes the qbuild and creates pricing for each system
    An array is returned and attached to the quote.info.pricing.systems object
*/

var dbldip={
  CARRIER: false,
  DAIKIN: false,
  PAYNE: false
}

var GETsystemprices=(qsets,qbuild)=>{
  let sparr = [];
  for(let x=0;x<qbuild.systems.length;x++){
    let sobj = {
      name:qbuild.systems[x].name,
      tiers:[]
    }
    for(let y=0;y<qbuild.systems[x].tiers.length;y++){  // loop through available tiers
        let tobj = {

          addbefore:GETaddprice(y,qbuild.systems[x].additions),
          minbefore:GETenhprice(y,qbuild.systems[x].enhancments),
          addafter:GETaddprice(y,qbuild.systems[x].additions,true),
          minafter:0,
          priceops:[]
        }
        for(let ft in qsets.fintiers){
          if(qbuild.systems[x].tiers[y].size){
            let flevel = GETfincost(
              qbuild.systems[x].tiers[y].size.pricebase,
              qsets.fintiers[ft],
              qbuild.systems[x].tiers[y],
              tobj
              );

              tobj.priceops.push(
                GETsizeprice(tobj,
                            qbuild.systems[x].tiers[y],
                            qbuild.systems[x],
                            y,
                            flevel)
              );
          }
        }
        sobj.tiers.push(tobj);
      }
      sparr.push(sobj);
  }
  return sparr;
}
var GETaddprice=(tnum,alist,iaq=false)=>{
  let addprice = 0;  // Accessory items
  let iaqprice = 0;  // IAQ items
  if(alist!=undefined){
    for(let x=0;x<alist.length;x++){
      if(alist[x].tiers[tnum]>0){
        if(alist[x].cat != 'Indoor Air Quality'){
          addprice+=(Number(alist[x]['price_sale'])*Number(alist[x].tiers[tnum]))
        }else{
          iaqprice+=(Number(alist[x]['price_sale'])*Number(alist[x].tiers[tnum]))
        }
      }
    }
  }
  return iaq==false?addprice:iaqprice;
}
var GETenhprice=(tnum,elist)=>{
  let enhprice = 0;
  if(elist!=undefined){
    for(let x=0;x<elist.length;x++){
      if(elist[x].tiers[tnum]<0){
        enhprice = elist[x].price_sale;
      }
    }
  }
  return enhprice;
}
var GETdscntstotal=(tnum,dlist,price,system,manrebate)=>{
  let dprice = 0;
  manrebate = Number(manrebate);
  if(dlist!=undefined){
    for(let x=0;x<dlist.length;x++){
      if(Number(dlist[x].tiers[tnum])>=1){dprice+=Number(dlist[x].tiers[tnum])}
      else{
        dprice+=(price-dprice-100)*Number(dlist[x].tiers[tnum]);
      }
    }
  }
  dprice = dprice + Number(system.size.rebateelec) - (manrebate>0?0:manrebate);
  return dprice;
}

var RUNpricecalc=(price,fincost,tinfo)=>{
  return (Number(price)+tinfo.addbefore-tinfo.minbefore)/(1-Number(fincost))+tinfo.addafter-tinfo.minafter;
}

var GETfincost=(price,qsets,system,tobj)=>{
  let fgroup;
  let mfg = (qsets.mfg[system.info.mfg.toUpperCase()]?system.info.mfg:'DEFAULT').toUpperCase();
  fgroup = {
    title:qsets.title,
    lender:qsets.mfg[mfg].lender,
    term:qsets.term,
    cost:0,
    rate:qsets.mfg[mfg].rate,
    desc:qsets.desc
  };
  //check if eligable for deal financing
  if(!dbldip[mfg]){
    let finprice = RUNpricecalc(price,qsets.mfg[mfg].deal,{
        addbefore:tobj.addbefore,
        minbefore:0,
        addafter:tobj.addafter,
        minafter:0,
        priceops:[]
      });
    let rebprice = RUNpricecalc(price,qsets.mfg[mfg].std,{
        addbefore:tobj.addbefore,
        minbefore:0,
        addafter:tobj.addafter,
        minafter:system.info.discmfg,
        priceops:[]
      });
    if(finprice>rebprice){
      fgroup.cost = qsets.mfg[mfg].std;
      fgroup.manrebate = system.info.discmfg;
    }else{
      fgroup.cost = qsets.mfg[mfg].deal;
      fgroup.manrebate = 0;
    }

  }else{
    fgroup.cost = qsets.mfg[mfg].deal;
    fgroup.manrebate = system.info.discmfg;
  }
  return fgroup;
}
var GETmonthlyfin=(price,payment)=>{
  if(payment.rate&&payment.rate!=undefined){
    if(payment.rate>=1){return price/payment.rate;}
    else{return price*payment.rate;}
  }else{return 0;}
}

var GETsizeprice=(tinfo,size,system,tiernum,payment)=>{
  //have fin cost decided
  let tpobj = {
    payment:payment,
    title:payment.title,
    opts:{
      sysprice:{
        price:RUNpricecalc(size.size.pricebase,payment.cost,tinfo),
        monthly:0
      },
      inprice:{
        price:RUNpricecalc(size.size.priceindoor,payment.cost,tinfo),
        monthly:0
      },
      outprice:{
        price:RUNpricecalc(size.size.priceoutdoor,payment.cost,tinfo),
        monthly:0
      }
    }
  }
  let partdisc = [];
  if(system.discounts){
    for(let x=0;x<system.discounts.length;x++){
      if(system.discounts[x].ref!='discmfg'){
        if(system.discounts[x].ref!='discinstnt'){  // Cut Instant discount in half for partial
          partdisc.push(system.discounts[x]);
        }else{
          partdisc.push({
            name:system.discounts[x].name,
            ref:system.discounts[x].ref,
            tiers:{
              0:system.discounts[x].tiers[0]/2,
              1:system.discounts[x].tiers[1]/2,
              2:system.discounts[x].tiers[2]/2,
              3:system.discounts[x].tiers[3]/2
            }
          });
        }
      }
    }
  }
  for(let po in tpobj.opts){ //loop through to apply discounts
    tinfo.minbefore = 0;
    tpobj.opts[po].price -= GETdscntstotal(
      tiernum,
      po=='sysprice'?system.discounts:partdisc,
      tpobj.opts[po].price,
      size,
      payment.manrebate
    );
    tpobj.opts[po].monthly = GETmonthlyfin(tpobj.opts[po].price,payment); //calculate monthly after discounts
  }
  //console.log('Size',size);
  //console.log('Price',tpobj);
  return tpobj;
}

module.exports={
  GETsystemprices
}
