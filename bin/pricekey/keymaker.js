/* Different functions to handle keys held on excel books
*/

var keyguide = require('./keygroups.json'); //get the list  of groups to include in key

/* Option property names
    takes the second row of data on the key (opt property names),
    and places them up against any following rows that align
    vertically with it.

    Mapping is done by the shared name of the first row in the key.

    PASS:
        objhd = first object in sheet key holding option var names
        obj = option to be assigned the var names in objhd
*/
var keyoptob = (obj,objhd,isvalue=true)=>{
    let tobj = {};

    for(let o in objhd){
        tobj[objhd[o]] = obj[o] || '';
        if(isvalue && 'instheight' == objhd[o] ||
           'pricenet'==objhd[o] ||
           'pricebase'==objhd[o] ||
           'priceoutdoor'==objhd[o] ||
           'priceindoor'==objhd[o])
           {tobj[objhd[o]]=Number(Number(tobj[objhd[o]]).toFixed(2))}
    }
    return tobj;
}


/* Accessory property names
*/
var keyaccprice = (obj={})=>{
    if(!obj || obj==undefined){obj={}}
    return{
      name:obj.name || '',
      notes:obj.notes || '',
      cat:obj.cat || '',
      model:obj.model || '',
      enhance:obj.enhance || '',
      contract:obj.contract || '',
      location:obj.location || '',
      labor:obj.labor || '',
      price_deduct:obj.price_deduct || '',
      price_sale:obj.price_sale || '',
    }
}

/* Key Maker for Tiered Keys
    PASS:
        fname = excel book key file name

    Reads in a
*/
var rrqkeymaker=(fname,reader)=>{
  //try{
      let xlkey = reader.readFile(fname);
      let key = {};
      /* key
          holds:
              .info = any key info (ie info.version) to be used across groups
              .groups = all of the groups, their subsequent tiers, and their subsequent options
      */
      key.groups = {}; // list of groups represented as an object
      key.accessories = []; //array of accessories and prices

      for(let x=0;x<xlkey.SheetNames.length;x++){ //Iterate through sheets
        if(keyguide.groups.includes(xlkey.SheetNames[x])){ //Collect all system groups
          let tsheet = reader.utils.sheet_to_json(xlkey.Sheets[xlkey.SheetNames[x]]);
          let tgroup = {}; //temporary tier GROUP object
                          // can hold variables/objects that all tiers use
          key.groups[xlkey.SheetNames[x]]={}; //name the GROUP
          let optvars = tsheet[0]; //size variables (for each system in the tier)
          key.groups[xlkey.SheetNames[x]].optheads = keyoptob(tsheet[1],optvars,false); //size headers to display (for each size variable)
          key.groups[xlkey.SheetNames[x]].systems = []; //array for tiers

          for(let y=2;y<tsheet.length;y++){ //Start loop of key group
            if(tsheet[y].tierid){ //found the next tier
              let ttier = {}; //temporary TIER object
              ttier.info = tsheet[y]; //take object as information (already have variable names on price book)
              console.log(ttier.info)
              y+=6;//skip to sizes
              /* Find sizes
                  loop till sysid is true, this will be the header row displayed in price book
              */
              while(y<tsheet.length && !tsheet[y].sysid ){y++;}
              y++;
              /* Gather all sizes and their info
              */
              ttier.opts = []; //array to hold tier options
              while(y<tsheet.length && !tsheet[y].tierid){
                ttier.opts.push(keyoptob(tsheet[y],optvars)); //conve
                y++;
              }
              y--;
              key.groups[xlkey.SheetNames[x]].systems.push(ttier);
            }
          }
        }
      }

      //read accessory pricing
      let accprice = reader.utils.sheet_to_json(xlkey.Sheets['Acc Price']);
      for(let x=0;x<accprice.length;x++){
        key.accessories.push(keyaccprice(accprice[x]))
      }
      return key;
  //}catch(e){return null;}
}


module.exports = {
    rrqkeymaker
}
