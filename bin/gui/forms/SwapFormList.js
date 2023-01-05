var {FormList} = require('../../repo/tools/box/vhc-formlist.js');
var {FILLselect} = require('../../repo/gui/js/tools/vg-displaytools.js');
var floatv = require('../../repo/gui/js/modules/vg-floatviews.js');
//CHANGES MADE TO OTHER FILES: Added 'FILLselect' to vg-displaytools.js

//TODO: Change system input to input, allow it to accept datalist
//TODO: Clarify what we are checking before adding input - currently, checks system+category combo
//TODO: Notify user of system already added

//TODO: extend FormList to utilize get/set .form (returns/accepts=[])

 
class SwapTable extends FormList{
    constructor({
            cont,
            list=[],
            info=null,
        }){
        super({
          cont:cont,
          list:list
        });

        //Initialize vars
        this.list = list; //data from quote
        this.info = info; //version of quote.build

        this.droplists={
          tiers:[
              {
                  text: 'Complete',
                  value: 0
              },
              {
                  text: 'Clever',
                  value: 1
              },
              {
                  text: 'Constant',
                  value: 2
              },
              {
                  text: 'Classic',
                  value: 3
              }
          ],
          systems:[],
          categories:[
            {
              text:" ",
              value:'',
              list:[]
            },
            {
                text: "Controls",
                value: "statmodel",
                list: []
            }
          ]
        }
        this.refreshed=false;
        //Close button
        this.closebutton = document.createElement('div');
        this.closebutton.id = "swapform-close";
        this.closebutton.className = "vg-float-frame-close";
        this.closebutton.innerText = "X";
        this.cont.parentElement.prepend(this.closebutton);
        this.closebutton.addEventListener('click', (eve)=>{
            floatv.RESETframe(this.cont.parentElement.parentElement);
        })

        //Load already created data
        this.form = this.list;

        document.getElementById(this.dom.addrow.system).addEventListener('click',(ele)=>{
          if(!this.refreshed){
            this.REFRESHswapdata();
            this.refreshed=true;
            setTimeout(()=>{this.refreshed=false;},5000);
          }
        });
        //Event listener for adding a new row
        this.cont.getElementsByClassName(this.dom.actions.addrow)[0].addEventListener('click', (eve)=>{
            this.CREATErow();
            this.refreshed=false;
        });

        FILLselect(document.getElementById(this.dom.addrow.swapto),this.GETswaptoitems(document.getElementById(this.dom.addrow.category).value), true);
        document.getElementById(this.dom.addrow.category).addEventListener('change',(ele)=>{
          FILLselect(document.getElementById(this.dom.addrow.swapto),this.GETswaptoitems(ele.target.value), true)
        });

        if(this.info){
          try{
            this.form = this.info.build.swaptable;
          }catch{}//pass bad data
        }
        if(info){this.REFRESHswapdata(false,true);}
        if (this.info.build.swaps && this.info.build.swaps.length > 0) {
          for (let i = 0; i < this.info.build.swaps.length; i++){
            this.CREATErow(this.info.build.swaps[i]);
          }
        }
    };//END CONSTRUCTOR

    dom = {
      cont:'container',
      actions:{
        addrow:'add-row'
      },
      values:{
        system:'system',
        tier: 'tier',
        category:'category',
        swap:'swap',
        swapto:'swapto'
      },
      addrow:{
        system:'swap-system-select',
        tier:'swap-tier-select',
        category:'swap-category-select',
        swapto:'swap-to-select'
      },
      options:{
        row:'row-options'
      }
    }

    INITcontent(){return`
    <div class='fl-list' id = 'table-cont'>

    </div>
    <div class = 'fl-header' id="input-cont">
        <select class = "bottom-select" id = "swap-system-select"></select>
        <select class = "bottom-select" id = "swap-tier-select"></select>
        <select class = "bottom-select" id = "swap-category-select"></select>
        <select class = "bottom-select" id = "swap-to-select"></select>
        <div class = "action-button add-row">Add Input</div>
    </div>
    `};

    rowcontent=`
        <div class = "${this.dom.values.system}"></div>
        <div class = "${this.dom.values.tier}"></div>
        <div class = "${this.dom.values.category}"></div>
        <div class = "${this.dom.values.swap}"></div>
        <div class = "${this.dom.values.swapto}"></div>
        <div class = "action-button" id = "delete-row">X</div>
        <div class = "row-options"></div>
    `

    SETrow(item={}){
        let row = document.createElement('div');
        row.classList.add('form-row');
        row.innerHTML=this.rowcontent;

        let deletebutton = row.getElementsByClassName('action-button')[0]
        deletebutton.addEventListener('click', (eve)=>{
            //Delete row
            deletebutton.parentElement.remove();
        })

        //Change ID of row to enable row check
        if (item!={}) {
            row.id = "row-"+item[this.dom.values.system]+"-"+item[this.dom.values.tier]+"-"+item[this.dom.values.category];
        }
        //Loop through class names in dom
        for(let v in this.dom.values){
            if(v) {
                let elem = row.getElementsByClassName(this.dom.values[v])[0]; //Check if element exists in the table
                if (elem) {
                    //Check and fill item table
                    if (item != {}) {
                          elem.innerText = item[v];
                    } else {
                        elem.innerText = '';//data[0][v]
                    }
                }
            }
        }
        //Create and add options
        let optionsdiv = row.getElementsByClassName(this.dom.options.row)[0];
        optionsdiv.innerText = JSON.stringify(item.options);
        return row;
    }

    GETrow(row){
      let item = {};
      for(let v in this.dom.values){
        item[v]=row.getElementsByClassName(this.dom.values[v])[0].innerText;
      }
      item.options=JSON.parse(row.getElementsByClassName(this.dom.options.row)[0].innerText);
      return item;
    }

    REFRESHswapdata(build=false,cats=false){
      if(build){this.info = build;}
      this.droplists.systems = [];
      for(let x=0;x<this.info.build.systems.length;x++){ //update systems
        this.droplists.systems.push({
          text:this.info.build.systems[x].name,
          value:x
        });
      }
      if(cats){//update categories
        for(let x=0;x<this.droplists.categories.length;x++){
          for(let y=1;y<this.info.key.accessories.length;y++){
            if(this.info.key.accessories[y].cat===this.droplists.categories[x].text && this.info.key.accessories[y].model!=''){
              this.droplists.categories[x].list.push({
                text:this.info.key.accessories[y].model,
                value:this.info.key.accessories[y].model
              });
            }
          }
        }
      }

      //FILL SYSTEMS
      FILLselect(document.getElementById(this.dom.addrow.system), this.droplists.systems, true);
      //FILL TIERS
      FILLselect(document.getElementById(this.dom.addrow.tier), this.droplists.tiers, true);
      //FILL CATEGORIES
      FILLselect(document.getElementById(this.dom.addrow.category), this.droplists.categories);

      //Clean table if build passed does not have items on swap table (save for later update)
    }

    GETswaptoitems(category){
      let varname;
      for(let x=0;x<this.droplists.categories.length;x++){
        if(category===this.droplists.categories[x].value){
          return this.droplists.categories[x].list;
        }
      }
      return [];
    }
    GETswapitem(system,tier,category){
      return this.info.build.systems[system].tiers[tier].size[category];
    }
    GETswapprice(model){
      let acclist = this.info.key.accessories;
      for(let x=0;x<acclist.length;x++){
        if(acclist[x].model===model){return acclist[x].price_sale;}
      }
      return 0;
    }

    /*Creates a row element.*/
    CREATErow(NewItem=undefined){
        //Define select variables
        let SystemSelectInput = document.getElementById(this.dom.addrow.system);
        let SystemSelection = SystemSelectInput[SystemSelectInput.selectedIndex];
        let TierSelectInput = document.getElementById(this.dom.addrow.tier);
        let TierSelection = TierSelectInput[TierSelectInput.selectedIndex];
        let CategorySelectInput = document.getElementById(this.dom.addrow.category);
        let CategorySelection = CategorySelectInput[CategorySelectInput.selectedIndex];
        let SwapToSelectInput = document.getElementById(this.dom.addrow.swapto);
        let SwapToSelection = SwapToSelectInput[SwapToSelectInput.selectedIndex];

        //Check if given item in constructor
        if (NewItem == undefined) {
          //Create row only if values aren't left empty
          if (TierSelection.value == "" || SystemSelection.value == "" || CategorySelection.value == "" || SwapToSelection.value==""){
              console.log("Can't be blank!");
          } else {
              NewItem = {
                system:SystemSelection.text,
                tier:TierSelection.text,
                category:CategorySelection.text,
                swap:this.GETswapitem(
                  SystemSelection.value,
                  TierSelection.value,
                  CategorySelection.value,
                ),
                swapto:SwapToSelection.text,//just add the model number to table this.GETswaptoitems(CategorySelection.value), //Here goes the list of options you want to swap to
                options:{
                  system:SystemSelection.value,
                  tier:TierSelection.value,
                  category:CategorySelection.value,
                }
            }
          }
        }
        NewItem.options.swapFROMprice=this.GETswapprice(NewItem.swap);
        NewItem.options.swapTOprice=this.GETswapprice(NewItem.swapto);
        //Add the item
        if (NewItem != undefined) {
          let RowCheck = document.getElementById("row-"+NewItem[this.dom.values.system]+"-"+NewItem[this.dom.values.tier]+"-"+NewItem[this.dom.values.category])

          if (!RowCheck) {
              this.list.push(NewItem);
              this.ADDitem(NewItem);
              //Reset the categories
              SystemSelectInput.selectedIndex = 0;
              TierSelectInput.selectedIndex = 0;
          }
        }
    }
}

module.exports={
  SwapTable
}
