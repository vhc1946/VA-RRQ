/* File to work with system selection module

    File is required in the rrq-quote.js file and uses some of the variables
    declared in said file.catch
    - vcontrol (viewcontroller.js)
    - ObjList (vg-list.js)
    - quotesls (routes.js)
    - qsettings //quote settings from appset
    - tquote //the quote

*/


//

var bidom={
  cont:'rrq-build-info',
  save:'rrq-save-quotebuild',
  edit:{
    cont:'build-info-edit'
  },
  job:{
    cont:'customer-module-edit',
    id:'q-info-id',
    name:'q-info-name',
    address:{
      street:'q-info-street',
      unit:'q-info-unit',
      city:'q-info-city',
      state:'q-info-state',
      zip:'q-info-zip'
    },
    customer:{
      id:'q-customer-id',
      fname:'q-customer-cfname',
      lname:'q-customer-clname',
      phone:'q-customer-cphone',
      email:'q-customer-cemail'
    }
  },
  notes:'q-info-notes'
}

var infocont = document.getElementById(bidom.edit.cont);
infocont.classList.add(vcontrol.vcdom.cont);
var qinfoviews = new vcontrol.ViewGroup({
  create:false,
  cont:infocont
})

var SETquoteinfo=()=>{
  document.getElementById(Titlebar.tbdom.title).innerText = tquote.id+' - '+tquote.name;
  document.getElementById(bidom.job.name).value = tquote.name;
  SETcustomerinfo();
  SETaddressinfo();
  //document.getElementById(bidom.job.notes).innerText = tquote.notes
}
var SETcustomerinfo=()=>{
  document.getElementById(bidom.job.customer.id).value = tquote.customer.id;
  document.getElementById(bidom.job.customer.fname).value = tquote.customer.name.split(',')[1] || '';
  document.getElementById(bidom.job.customer.lname).value = tquote.customer.name.split(',')[0] || '';
  document.getElementById(bidom.job.customer.phone).value = tquote.customer.phone;
  document.getElementById(bidom.job.customer.email).value = tquote.customer.email;
}
var SETaddressinfo=()=>{
  document.getElementById(bidom.job.address.street).value = tquote.street;
  document.getElementById(bidom.job.address.unit).value = tquote.unit;
  document.getElementById(bidom.job.address.city).value = tquote.city;
  document.getElementById(bidom.job.address.state).value = tquote.state;
  document.getElementById(bidom.job.address.zip).value = tquote.zip;
}

var GETquoteinfo=()=>{
  tquote.name = document.getElementById(bidom.job.name).value;
  GETcustomerinfo();
  GETaddressinfo();
  //tquote.notes = document.getElementById(bidom.job.notes).innerText;
}
var GETcustomerinfo=()=>{
  tquote.customer.id = document.getElementById(bidom.job.customer.id).value
  tquote.customer.name = document.getElementById(bidom.job.customer.lname).value + ',' + document.getElementById(bidom.job.customer.fname).value
  tquote.customer.phone = document.getElementById(bidom.job.customer.phone).value
  tquote.customer.email = document.getElementById(bidom.job.customer.email).value
}
var GETaddressinfo=()=>{
  tquote.street = document.getElementById(bidom.job.address.street).value
  tquote.unit = document.getElementById(bidom.job.address.unit).value
  tquote.city = document.getElementById(bidom.job.address.city).value
  tquote.state = document.getElementById(bidom.job.address.state).value
  tquote.zip = document.getElementById(bidom.job.address.zip).value
}


var InitInfoBuild=()=>{
  SETquoteinfo();
}

module.exports={
  InitInfoBuild,
  GETquoteinfo
}
