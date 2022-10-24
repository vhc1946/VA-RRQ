

const path = require('path');
const fs = require('fs');
var DataStore = require('nedb');

//
var apppaths = require('../../app/paths.json');


var spdbroot = path.join(apppaths.deproot,apppaths.store.root);
console.log(apppaths.deproot);
var spquotes = '/quotes/';
var mquotefilename=apppaths.store.mquotes;

var pricekeyfilename='pricekey.json';

// User Storage Paths ///////////////////////////////////////////
var cuserroot = 'C:/IMDB/'
var rrqlocalroot = cuserroot + '/rrq/';

var uquotefilename='userquotes.db';
/////////////////////////////////////////////////////////////////

// Setup User Storage Settings //////////////////////////////////
var ustoresettings;
try{
fs.mkdirSync(cuserroot);
}catch{}
try{
  fs.mkdirSync(rrqlocalroot);
}catch{}
try{//try to get the file
  ustoresettings = require(rrqlocalroot+'appstoresettings.json');
}catch{//create the file
  ustoresettings = {
    cansync:true, //user allowed to sync to master
    needsync:false, //user needs to sync to master
    connected:true //user has internet connection
  }
  fs.writeFileSync(rrqlocalroot+'appstoresettings.json',JSON.stringify(ustoresettings));
}
/////////////////////////////////////////////////////////////////

/* Saves the price key to file
*/
var SavePriceKey=(key,spdrive)=>{
  fs.writeFileSync(path.join(spdrive,spdbroot,pricekeyfilename),JSON.stringify({
    date:Date(),
    key:key
  }));
}
var GetPriceKey=(spdrive)=>{
  console.log(path.join(spdrive,spdbroot,pricekeyfilename))
  try{
    return require(path.join(spdrive,spdbroot,pricekeyfilename));
  }catch{return null;}
}
//saves any settings to appstoresettings.json
var SaveUStoreSettings=()=>{
  fs.writeFileSync(rrqlocalroot+'appstoresettings.json',JSON.stringify(ustoresettings));
}

/* USER QUOTES
    THIS.
    - mquotesdb - all department quotes (located on spdrive)
    - quotesdb - user quotes (located on cdrive)
    - syncer - utily for db syncing


    constructor()

*/
class UQuotes{
  constructor(mroot){
    console.log(mroot);
    let spqroot = path.join(mroot,spdbroot,spquotes);
    fs.readdir(spqroot,(err,files)=>{
      if(files.length>1){ //if copies were made
        for(let x=0;x<files.length;x++){ //loop and clean files
          if(files[x]!=mquotefilename){ //skip the original file
            fs.rmSync(path.join(spqroot,files[x]));
          }
        }
      }
      this.mquotesdb = new DataStore(path.join(spqroot,mquotefilename)); //connect to master
      this.mquotesdb.loadDatabase();
      this.mquotesdb.ensureIndex({fieldName:'id',unique:true});
    });
    this.quotesdb = new DataStore(rrqlocalroot+uquotefilename); //connect to user quote
    this.quotesdb.loadDatabase();
    this.quotesdb.ensureIndex({fieldName: 'id', unique: true});

    this.syncer={ //sync util
      synced:-1,
      tosync:0
    }
  }

  ISsyncing=()=>{
    if(this.syncer.synced<=this.syncer.tosync){
      this.syncer.synced = -1;
      this.syncer.tosync = 0;
      return true;
    }else{return false}
  }

  SETUPuserquotes=(uname,group)=>{
    return new Promise((resolve,reject)=>{
      if(this.mquotesdb){
        let flts = {};
        switch(group){
          case 'MAN':{
            ustoresettings.cansync=false; //manager can not sync quotes to master
            break;
          }
          case 'DEV':{
            ustoresettings.cansync=false;
            break;
          }
          case 'CONS':{
            ustoresettings.cansync=true; //consultants can sync quotes to master
            flts.estimator = uname;
          }
        }
        if(ustoresettings.connected){ //computer is connected
          this.SYNCFROMmaster(flts).then(
            (message)=>{
              console.log(message);
              return resolve(true);
            }

          ); //load the users quotes to local storage
        }else{
          //use what is loaded in quotes
          return resolve(false);
        }
      }else{console.log('here');return resolve(false)}
    });
  }

  SYNCFROMmaster=(flts={})=>{
    return new Promise((resolve,reject)=>{
      if(this.mquotesdb){
        this.CLEARuserquotes().then(
          (message)=>{
            console.log('old list -',message);
            if(message.length>0){
              this.SYNCTOmaster(message);
            }
            this.mquotesdb.loadDatabase();
            this.mquotesdb.find(flts,(err,docs)=>{
              if(!err && docs){
                let y = 0;
                for(let x=0;x<docs.length;x++){
                  this.quotesdb.insert(docs[x],(err,ndoc)=>{
                    y++;
                    if(y>=docs.length){
                      console.log('done')
                      return resolve(true);
                    }
                  });
                }
                return resolve(true);
              }else{return resolve(false)}
            });
          }
        );
      }else{return resolve(false)}
    });
  }

  SYNCTOmaster=(list)=>{
    console.log('TO master')
    if(this.mquotesdb){
      if(list){
        this.syncer.synced = 0;
        for(let x=0;x<list.length;x++){
          this.syncer.tosync = list.length;
          this.mquotesdb.update({id:list[x].id},{$set:list[x]},{},(err,numup)=>{
            if(err){this.syncer.synced++;console.log(err)}
            if(numup==0){
              this.mquotesdb.insert(list[x],(err,ndoc)=>{this.syncer.synced++});
            }else{console.log(x);this.syncer.synced++;console.log('has updated')}
          });
        }
      }else{}
      //this.mquotesdb.persistence.compactDatafile();
      return true;
    }else{return false}
  }

  /*Clears the user quotes database
    Attempts to return docs
  */
  CLEARuserquotes=()=>{
    return new Promise((resolve,reject)=>{
      this.quotesdb.find({},(err,docs)=>{
        if(err){return resolve(2)}
        else if(docs){
          this.quotesdb.remove({},{multi:true},(err,numremoved)=>{});
          return resolve(docs)
        }else{return resolve(1)}
      });
    })
  }

  QUERYdb=(flts={})=>{
    return new Promise((resolve,reject)=>{
      this.quotesdb.loadDatabase();
      this.quotesdb.find(flts,(err,docs)=>{
        if(err){return resolve(null)}
        else if(docs){return resolve(docs)}
        else{return resolve([])}
      });
    });
  }

  UPDATEdb=(query={},update={},options={})=>{
    return new Promise((resolve,reject)=>{
      this.quotesdb.update(query,update,options,(err,numrep)=>{
        if(numrep>0){resolve({numrep:numrep,err:null})}
        else{resolve({numrep:numrep,err:err})}
      });
    })
  }

  INSERTdb=(doc)=>{
    return new Promise((resolve,reject)=>{
      if(doc){
        this.quotesdb.insert(doc,(err,doc)=>{
          if(doc){resolve({doc:doc,err:null})}
          else{resolove({doc:null,err:err})}
        })
      }
    });
  }

  REMOVEdoc=(query={},multi=false)=>{
    return new Promise((resolve,reject)=>{
      this.quotesdb.loadDatabase();
      this.quotesdb.remove(query,{multi:multi},(err,num)=>{
        console.log(num);
        if(!err){
          this.mquotesdb.loadDatabase();
          this.mquotesdb.remove(query,{multi:multi},(err,num)=>{
            console.log(num);
            if(!err){return resolve(true)}
            else{return resolve(false)}
          })
        }else{return resolve(false);}
      });
    });
  }
}

module.exports={
  ustoresettings,
  SaveUStoreSettings,
  UQuotes,
  SavePriceKey,
  GetPriceKey
}
