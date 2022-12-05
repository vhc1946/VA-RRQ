
const  path = require('path'),
       fs = require('fs'),
       os= require('os'),
       reader = require('xlsx'),
       request = require('request'),
       {exec} = require('child_process');

// From vogel repository ///////////////////////////////////////////////////////

var {aappuser} = require('./bin/repo/ds/users/vogel-users.js');
var apppaths = require('./app/paths.json');
var {viewtools,app,BrowserWindow,ipcMain} = require('./bin/repo/tools/box/electronviewtool.js');
//var {INITmain} = require('./bin/repo/gui/js/modules/vg-titlebar.js');

var {aquote}=require('./bin/repo/ds/quotes/vogel-quote.js');
var {ObjList}=require('./bin/repo/tools/box/vg-lists.js');

var {loginroutes}=require('./bin/repo/gui/js/modules/login.js');

////////////////////////////////////////////////////////////////////////////////

var {rrqkeymaker} = require('./bin/pricekey/keymaker.js');
var {navroutes,settingsroutes,qdashroutes,quoteroutes}=require('./bin/routes.js');

var pbexcelpath = path.join(apppaths.deproot,apppaths.pricing.book);
var pbjsonpath = '';

//Middleware ///////////////////////////////////////////////////////////////////
var au = require('./bin/appuser.js'); //initialize the app user object
var approot = path.join(au.auser.cuser.spdrive,apppaths.deproot);
var appsettpath = path.join(approot,apppaths.settings);
var controlsroot = path.join(__dirname,'/controllers/'); //dir path to views
var storeroot = path.join(__dirname,'/db/store/'); //dir path to db store
var binroot = path.join(__dirname,'/bin/'); //dir path to bin

//application settings
var appset = require(appsettpath);
appset.dev.on = false;

var qflows = require('./bin/back/workflows/rrq-quoteflows.js');

console.log("CHECK",apppaths);
///////////////////////////////////////////////////////////
var mqlist = new ObjList(qlist);

var mainv; //holds the main BrowserWindow
var quotev=[] //holds open quotes {id:'',view:BrowserWindow()}
var stdwidth = 1080;
var stdheight = 750;
// DB Setup ////////////////////////////////////////////////////////////////////

var quotedb =require('./bin/db/dbsetup.js');
var udb = new quotedb.UQuotes(au.auser.cuser.spdrive); //holds class for user quotes db

//console.log(fs.readFileSync('README.txt').toString());

var qlist = require(storeroot + 'quotes.json'); //temporary for testing

require('dns').resolve('www.google.com',(err)=>{ //test for internet connection
  if(err){//is not connected
    quotedb.ustoresettings.connected = false;
  }
  else{//is connected
    quotedb.ustoresettings.connected = true;
    if(quotedb.ustoresettings.needsync){
      quotedb.SYNCquoteuserTOmaster(quotedb.SetupMasterQuotes(au.auser.cuser.spdrive));//push the userlocalstroge of quotes to masterquotes
    }
  }
});

////////////////////////////////////////////////////////////////////////////////

/* LANDING PAGE
    The landing page will more often be the login screen
    This login screen can be skipped by editing the
    appset.dev.on = true. This will default to main.html
    If the developer wants to skip to a page, the
    appset.dev.page can have a desired page file
    name
*/
app.on('ready',(eve)=>{
  if(!appset.dev.on){
    console.log(au.auser);
    if(appset.users[au.auser.uname]==undefined){
      mainv = viewtools.loader(controlsroot + 'login.html',stdwidth,stdheight,false,false,'hidden');
    }else{
      try{//attempt to open users default page
        mainv = viewtools.loader(controlsroot + appset.groups[au.auser.config.group].main,stdwidth,stdheight,false,false,'hidden');
      }catch{mainv = viewtools.loader(controlsroot + 'login.html',stdwidth,stdheight,false,false,'hidden');}
    }
    mainv.on('close',(eve)=>{

      qflows.GARBAGEquotefolders();
      udb.QUERYdb().then(
        (list)=>{
          console.log(list);
          udb.SYNCTOmaster(list);
        }
      )
      viewtools.loader(controlsroot + 'loadscreen.html',500,500,true,false,'hidden');
    });
  }else{appset.dev.page==''?mainv = viewtools.loader(controlsroot+'main.html',stdwidth,stdheight,false,false,false):mainv=viewtools.loader(controlsroot+appset.dev.page,stdwidth,stdheight,false,false,'hidden')}
});

/* APP login
    data:{
      user:'',
      pswrd:''
    }

    Recieve a user name and password from login form AND
    attach the application auth code to it. The api is
    queried to check both the auth code and the user
    credentials.

    If the access/login to the api is a success, the
    appset.users is checked for a match to the user name.

    If the user is found in appset.users, that users group
    view (appset.groups.main) 'dash' is loaded
*/
ipcMain.on(loginroutes.submit,(eve,data)=>{
  if(au.SETUPappuser(appset.users,data.uname,data.pswrd)){ //check to see if username matches app settings
    udb.SETUPuserquotes(au.auser.uname,au.auser.config.group).then(
      (message)=>{
        viewtools.swapper(mainv,controlsroot + appset.groups[au.auser.config.group].main,stdwidth,stdheight);
      }
    );
  }else{eve.sender.send(loginroutes.submit,{status:false,msg:'Not an app user',user:null})}
});

// Views /////////////////////////////////////////////////////////////////

// Request login screen
ipcMain.on(navroutes.gotologin,(eve,data)=>{
  au.RESETappuser();
  if(quotedb.ustoresettings.connected && quotedb.ustoresettings.cansync){//attempt to sync the users quotes to master
    udb.CLEARuserquotes().then(
      (list)=>{
        if(list.length>0){
          console.log('GOING TO')
          udb.SYNCTOmaster(list);
        }
      }
    );
  }
  console.log('login')
  viewtools.swapper(mainv,controlsroot + 'login.html',stdwidth,stdheight);
});
ipcMain.on(navroutes.gotometrics,(eve,data)=>{ //METRICS PAGE
  console.log(data);
  viewtools.swapper(mainv,controlsroot + 'metrics.html',stdwidth,stdheight,false,false,'hidden');
});
ipcMain.on(navroutes.gotoVHCdash,(eve,data)=>{ //DASH
  console.log(data);
  viewtools.swapper(mainv,controlsroot + 'quotedash.html',stdwidth,stdheight,false,false);
});
ipcMain.on(navroutes.gotosettings,(eve,data)=>{ //DASH
  console.log(data);
  viewtools.loader(controlsroot + 'settings.html',stdwidth,stdheight,false,false,'hidden');
});
ipcMain.on(navroutes.gotopresi,(eve,data)=>{
  if(data.quote&&data.quote!=undefined){
    quotepresi = data.quote;
    viewtools.loader(controlsroot + 'presentation.html',stdwidth,stdheight,false,false,'hidden');
  }else{
    eve.sender.send(navroutes.gotopresi,{msg:'NO QUOTE'})
  }
});

// Titlebar Request
ipcMain.on('view-minimize',(eve,data)=>{
  BrowserWindow.getFocusedWindow().minimize();
});


var PRINTscreen = (win,fpath =os.tmpdir(),fname ='print',open = true)=>{
  if(fpath && (win && win!=undefined)){
    try{
      let fullpath = path.join(fpath,fname+'.pdf');
      win.printToPDF({printBackground:true}).then(data => {
        fs.writeFile(fullpath, data, (error) => {
          if (!error){
            console.log(`Wrote PDF successfully to ${fpath}`)
            if(open){exec(path.join(fullpath).replace(/ /g,'^ '));}
          }else{console.log(`Failed to write PDF to ${fpath}: `, error)}
        });
      }).catch(error => {console.log(`Failed to write PDF to ${fpath}: `, error);win.send('print-screen',{msg:'File Open'});})
    }catch{console.log('Can not print')} //File is open, bring file into view
  }
}

ipcMain.on('print-screen',(eve,data)=>{
  if(data!=undefined){
    PRINTscreen(eve.sender,data.path,data.file);
  }else{PRINTscreen(eve.sender);}
});
/////////////////////////////////////////////////////////////////////////


/* CALL to check and make Quote Sync has completed
    the call will continue unil it the call returns
    close=true;
*/
ipcMain.on('LOADcheck',(eve,data)=>{
  let close = false;
  if(quotedb.ustoresettings.connected){
    close = udb.ISsyncing();
  }else{
    close=true;
  }
  eve.sender.send('LOADcheck',close);
});

/* DASH routes  ////////////////////////////////////////////////////////
*/

/* Get the dash setup for a user
    Provides the clients with the full list of quotes from uquotesdb
    RECIEVE:
    - data '' // simplay message

    SEND:
    - msg:'' // status message
    - quotes:[] //
*/
ipcMain.on(qdashroutes.getuserquotes,(eve,data)=>{
  if(au.auser.uname != ''){
    udb.QUERYdb().then(
      (list)=>{
        if(list){
          if(list.length==0){eve.sender.send(qdashroutes.getuserquotes,{msg:String('No Quotes to Load'),quotes:[]});}
          else{
            lists = qflows.CLEANquotefolders(list,au.auser);
            for(let x=0;x<lists.updates.length;x++){
              udb.UPDATEdb({id:lists.updates[x].id},{$set:lists.updates[x]});
            }
            eve.sender.send(qdashroutes.getuserquotes,{msg:String('Loaded Quotes'),quotes:lists.quotes});
          }
        }else{eve.sender.send(qdashroutes.getuserquotes,{msg:String('Failed to Access Quotes'),quotes:[]});}
      }
    )
  }
});

/* Opens a quote
    RECIEVE:
    - data{
      id:'' //quote id
    }
    RETURN:
    - data{
      msg:''
      opennew:true/false //if a new window was open
      id:'quote id',
      name:'quote name'
    }
*/
ipcMain.on(qdashroutes.loadquote,(eve,data)=>{
  let isopen = false;
  if(data.id&&data.id!=undefined){ //check data.id
    //for(let x=0;x<quotev.length;x++){ //see if the id is in the quotev[]
    //  if(quotev[x].id==data.id){
        //open that BrowserWindow
    //    quotev[x].view.maximize();
    //    isopen = true;
    //    eve.sender.send(qdashroutes.loadquote,{msg:'Quote -'+data.id+'- is open', opennew:false,id:data.id});
    //  }
    //}
    if(!isopen){
      quotev.push({id:data.id,view:viewtools.loader(controlsroot+'quoter.html',stdwidth,stdheight,false,false,'hidden')});
      eve.sender.send(qdashroutes.loadquote,{msg:'Quote -'+data.id+'- was loaded',id:data.id,name:''})
    }
  }else{
    eve.sender.send(qdashroutes.loadquote,{msg:'No quote to open...',id:null});
  }
});

/* Get a quote*/
ipcMain.on(qdashroutes.getquote,(eve,data)=>{
  if(data.id&&data.id!=undefined){
    udb.QUERYdb({id:data.id}).then(
      (doc)=>{
        if(doc){
          if(doc.length>0){
            eve.sender.send(qdashroutes.getquote,{msg:'Quote Loading..',quote:doc[0]});
          }else{eve.sender.send(qdashroutes.getquote,{msg:'Quote WAS NOT Found...',quote:null})}
        }
        else{eve.sender.send(qdashroutes.getquote,{msg:'No Quote',quote:null})}
      }
    )
  }else{eve.sender.send(qdashroutes.getquote,{msg:'No Quote',quote:null})}
});

/* Create new quote
    Creates a new and unique quote number
    (appname)-(getTime())
*/
var nxtquotenum=()=>{
  return appset.name+'-'+ new Date().getTime();
}

ipcMain.on(qdashroutes.createquote,(eve,data)=>{
  if(data!=undefined && data.name !=''){
    let nquote = aquote({
      id:nxtquotenum(),
      name:data.name,
      estimator:au.auser.uname,
      dept:appset.dept,
      customer:data.customer,
      info:{
        key:quotedb.GetPriceKey(au.auser.cuser.spdrive).key, //add price key to quote
      }
    });

    qflows.INITquotefolder(nquote,au.auser);
    udb.INSERTdb(nquote).then(
      (res)=>{
        if(res.doc){eve.sender.send(qdashroutes.createquote,{msg:'New Quote Created',quote:res.doc})}
        else{eve.sender.send(qdashroutes.createquote,{msg:'New Quote was NOT Created',quote:null})}
      }
    )
  }else{eve.sender.send(qdashroutes.createquote,{msg:'Must enter a Quote Name',quote:null})}
});

ipcMain.on(quoteroutes.syncquotesmaster,(eve,data)=>{
  if(quotedb.ustoresettings.connected){
    quotedb.ustoresettings.needsync = false;
    if(quotedb.ustoresettings.cansync){
      udb.QUERYdb().then(
        (list)=>{
          if(list){
            udb.SYNCTOmaster(list);
          }
        }
      )
    }
  }else{
    quotedb.ustoresettings.needsync = true;
  }
  quotedb.SaveUStoreSettings();
});

////////////////////////////////////////////////////////////////////////
//  QUOTER routes ////////////////////////////////////////////////////////

/* SAVE QUOTE
    data:
      - quote = a quote to save
      - summary = array of systems on the summary page to be saved
*/
ipcMain.on(quoteroutes.savequote,(eve,data)=>{
  if(data.quote.id&&data.quote.id!=undefined){
    data.quote.lastdate = new Date().toISOString().split('T')[0]; //update last Date
    udb.UPDATEdb({id:data.quote.id},{$set:data.quote}).then(
      (res)=>{
        if(res.numrep>0){eve.sender.send(quoteroutes.savequote,{msg:'Quote WAS Saved',quote:data.quote})}
        else{eve.sender.send(quoteroutes.savequote,{msg:'Quote WAS NOT Saved',quote:null});}
      }
    )
    PRINTscreen(eve.sender,path.join(au.auser.cuser.spdrive,data.quote.froot),data.quote.name,false);
  }
});

ipcMain.on(quoteroutes.deletequote,(eve,data)=>{
  udb.QUERYdb({id:data}).then(
    (doc)=>{
      if(doc){
        qflows.DELETEquotefolder(doc[0],au.auser).then(
          (del)=>{
            //if(del){
              console.log('removing docs',del)
              udb.REMOVEdoc({id:data}).then(
                (dell)=>{
                  console.log(dell);
                  if(dell){
                    eve.sender.send(quoteroutes.deletequote,{msg:'Quote WAS deleted',status:true});
                  }else{eve.sender.send(quoteroutes.deletequote,{msg:'Quote was NOT deleted',status:false});}
                }
              )
            //}
          }
        );
      }
      else{eve.sender.send(quoteroutes.deletequote,{msg:'Quote was NOT deleted',status:false});}
    }
  )
});
/* Request to update
*/
ipcMain.on(quoteroutes.refreshquotekey,(eve,data)=>{
  let key = quotedb.GetPriceKey(au.auser.cuser.spdrive).key;
  if(key&&key!=undefined){
    eve.sender.send(quoteroutes.refreshquotekey,{msg:'Key was updated!',key:key});
  }else{eve.sender.send(quoteroutes.refreshquotekey,{msg:'Key is not available',key:null})}
});

/*  Create a quote
    PASS:
    - data:{
        quote: quote to create for
        contract: contract object to create from
      }
*/
ipcMain.on(quoteroutes.createcontract,(eve,data)=>{
  if(data.quote!=undefined && data.contract!=undefined){
    qflows.UPDATEcontract(data.contract,data.quote.froot,au.auser).then(
      (stat)=>{
        console.log(stat);
        if(stat){
          data.quote.info.contracts[data.contract.system.name]=data.contract;
          eve.sender.send(quoteroutes.createcontract,{msg:'Contract Created',status:true,quote:data.quote});
        }
        else{eve.sender.send(quoteroutes.createcontract,{msg:'Contract NOT Updated, Close contract file',status:false})}
      }
    );
  }
});

ipcMain.on(quoteroutes.sellquote,(eve,data)=>{
  if(data && data!=undefined){
    data.subdate = new Date().toISOString();
    fs.readdir(path.join(au.auser.cuser.spdrive,data.froot,qflows.paths.jobsubfolders.contracts),(err,files)=>{
      if(!err && files.length>0){
        qflows.MOVEquotefolder(data,au.auser,'S').then(
          (quote)=>{
            if(quote){
              udb.UPDATEdb({id:quote.id},{$set:quote}).then(
                (update)=>{
                  udb.QUERYdb().then(
                    (list)=>{eve.sender.send(qdashroutes.getuserquotes,{msg:'Update Quotes',quotes:list});}
                  )
                }
              );
              eve.sender.send(quoteroutes.sellquote,{msg:'Quote HAS been marked sold',status:true})
            }
            else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote was NOT sold',status:false})}
          }
        )
      }else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote DOES NOT have a contract',status:false})}
    });
  }else{eve.sender.send(quoteroutes.sellquote,{msg:'Quote was NOT sold',status:false})}
});
/////////////////////////////////////////////////////////////////////////

/* PRESENTATION routes //////////////////////////////////////////////////
*/
var quotepresi = null;

/*
    PASS:
    - data.quote
*/
ipcMain.on(quoteroutes.createpresentation,(eve,data)=>{
  console.log(quotepresi);
  if(quotepresi&&quotepresi!=undefined){
    eve.sender.send(quoteroutes.createpresentation,{msg:'',quote:quotepresi,user:au.auser});
    //quotepresi = null; //reset quotepresi
  }else{eve.sender.send(quoteroutes.createpresentation,{msg:'',quote:null,user:au.auser});}
});
/////////////////////////////////////////////////////////////////////////

ipcMain.on('GET-quotesettings',(eve,data)=>{
  eve.sender.send('GET-quotesettings',appset.quotesettings);
});

ipcMain.on('GET-appsettings',(eve,data)=>{
  console.log(data);
  eve.sender.send('GET-appsettings',appset);
});

// ADMIN routes ////////////////////////////////////////////////////////
ipcMain.on('POST-saveappsettings',(eve,data)=>{
  console.log(data);
  eve.sender.send('POST-saveappsettings',{msg:'Saved...',data:appset})
});

/*RECIEVE:
  - data: '' //simple message

  SEND:
  - msg: '' //status message for display
  - data: {} || null // the key object or null
*/
ipcMain.on(settingsroutes.createkey,(eve,data)=>{
  let key = rrqkeymaker(path.join(au.auser.cuser.spdrive,pbexcelpath),reader);
  if(key&&key!=undefined){
    console.log(key);
    quotedb.SavePriceKey(key,au.auser.cuser.spdrive);
    eve.sender.send(settingsroutes.createkey,{msg:'Key was created',key:key});
  }else{eve.sender.send(settingsroutes.createkey,{msg:'Key was NOT created',key:null});}
});

ipcMain.on(settingsroutes.save,(eve,data)=>{
  if(data&&data!=undefined){
    appset=data;
    fs.writeFile(appsettpath,JSON.stringify(appset),{},(err)=>{
      if(err){
        console.log(err);
        eve.sender.send(settingsroutes.save,{msg:'Could NOT Save...',data:null})
      }else{
        eve.sender.send(settingsroutes.save,{msg:'Settings HAVE Saved...',data:appset})
      }
    });
  }
});
/////////////////////////////////////////////////////////////////////////

var {SupportLog} = require('./bin/repo/logger/store/store-support.js')
var appsupport = new SupportLog(approot);
/////  Logger Calls ///////////
ipcMain.on('open-support-ticket', (eve,data)=>{
  if(data.id!=undefined){
    data.id=appset.name + '-' + new Date().getTime();
    data.dept = appset.dept;
    data.user=au.auser.uname;
    data.phone=au.auser.config.phone;
    data.email=au.auser.config.email;
    appsupport.INSERTdb(data).then(
      (stat)=>{
        if(stat){eve.sender.send('open-support-ticket',{msg:"Support Ticket Submitted",status:true});}
        else{eve.sender.send('open-support-ticket',{msg:"Support Ticket NOT Submitted",status:false});}
      }
    );
  }
});
