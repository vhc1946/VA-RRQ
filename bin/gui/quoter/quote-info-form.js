
class QuoteInfoForm extends VHCforms{
  constructor(cont){
    super(cont);

  }

  qidom={
    inputs:{
      id:'q-customer-id',
      name:''
      fname:'q-customer-cfname',
      lname:'q-customer-clname',
      phone:'q-customer-phone',

    }
  }

  custformcontent=`
    <div class="customer-edit-cinfo">
        <div class="customer-header"><div></div><div>Client Info</div></div>
        <div>Cust Code</div><input id="q-customer-id"/><!--Create searchable/drop list for optional autofill-->
        <div>First Name</div><input id="q-customer-cfname"/>
        <div>Last Name</div><input id="q-customer-clname"/>
        <div>Phone</div><input id="q-customer-cphone"/>
        <div>Email</div><input id="q-customer-cemail" type="email"/>
    </div>
  `
  infoformcontent=`
    <div class="customer-edit-jinfo">
        <div class="customer-header"><div>Job Info</div><div></div></div>
        <div style="display:none;">Quote Number</div><input id="q-info-id" style="display:none";/><!--Create searchable/drop list for optional autofill-->
        <div>Quote Name</div><input id="q-info-name"/>
    </div>
    <div class="customer-edit-jaddress">
        <div class="customer-header"><div>Job Address</div><div></div></div>
        <div>Street</div><input id="q-info-street"/>
        <div>Unit</div><input id="q-info-unit"/>
        <div>City</div><input id="q-info-city"/>
        <div>State</div><input id="q-info-state"/>
        <div>Zip</div><input id="q-info-zip"/>
    </div>
  `
  trackformcontent=`
    <div>Time of Day<input  type="search" list="track-timeofday-droplist"/></div>
    <div>Source<input  type="search" list="track-source-droplist"/></div>
    <div>Lead<input type="search" list="track-source-droplist"/></div>
    <div>Quote Present Date<input type="date"/></div>
    <div>Quote Present Via<input type="search" list="track-prsntvia-droplist"/></div>
    <div>Book Price<input type="checkbox"/></div>
    <div>Financed<input type="checkbox"/></div>
  `


}
