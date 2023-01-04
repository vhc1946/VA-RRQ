var {FormList} = require('../../repo/tools/box/vhc-formlist.js');
var {FILLselect} = require('../../repo/gui/js/tools/vg-displaytools.js');
var floatv = require('../../repo/gui/js/modules/vg-floatviews.js');
//CHANGES MADE TO OTHER FILES: Added 'FILLselect' to vg-displaytools.js

//TODO: Change system input to input, allow it to accept datalist
//TODO: Clarify what we are checking before adding input - currently, checks system+category combo
//TODO: Notify user of system already added

//TODO: extend FormList to utilize get/set .form (returns/accepts=[])

const SwapToExample = [
    {
        text: "Thermostat Large",
        value: "TH45"
    },
    {
        text: "Thermostat Small",
        value: "TH25"
    }
]


class SwapTable extends FormList{
    constructor({
            cont,
            list=[]
        }){
        super({
          cont:cont,
          list:list
        });

        //Initialize vars
        this.list = list; //data from quote
        this.quote = null;

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
                text: "Controls",
                value: "statmodel",
                list: []
            }
          ]
        }

        //Close button
        this.closebutton = document.createElement('div');
        this.closebutton.id = "vg-float-frame-close";
        this.closebutton.className = "vg-float-frame-close";
        this.closebutton.innerText = "X";
        this.cont.parentElement.appendChild(this.closebutton);
        this.closebutton.addEventListener('click', (eve)=>{
            floatv.RESETframe(this.cont.parentElement.parentElement);
        })

        //Load already created data
        this.form = this.list;

        //Event listener for adding a new row
        this.cont.getElementsByClassName('add-row')[0].addEventListener('click', (eve)=>{
            this.CREATErow();
        });

    };//END CONSTRUCTOR

    dom = {
      cont:'container',
      values:{
        system:'system',
        tiers: 'tiers',
        category:'category',
        swap:'swap',
        swapto:'swapto'
      },
      addrow:{
        system:'swap-system-select',
        tier:'swap-tier-select',
        category:'swap-category-select'
      }
    }
    INITcontent(){return`
    <div class='fl-list' id = 'table-cont'>

    </div>
    <div class = 'fl-header' id="input-cont">
        <select class = "bottom-select" id = "swap-system-select"></select>
        <select class = "bottom-select" id = "swap-tier-select"></select>
        <select class = "bottom-select" id = "swap-category-select"></select>
        <div class = "action-button add-row">Add Input</div>
    </div>
    `};

    rowcontent=`
        <div class = "${this.dom.values.system}"></div>
        <div class = "${this.dom.values.tiers}"></div>
        <div class = "${this.dom.values.category}"></div>
        <div class = "${this.dom.values.swap}"></div>
        <select class = "${this.dom.values.swapto}"><select>
        <div class = "action-button" id = "delete-row">X</div>
    `

    SETrow(item={}){
        let row = document.createElement('div');
        row.classList.add('form-row');
        row.innerHTML=this.rowcontent;

        let deletebutton = row.getElementsByClassName('action-button')[0]
        deletebutton.addEventListener('click', (eve)=>{
            //Delete row
            console.log("removing")
            deletebutton.parentElement.remove();
        })

        //Change ID of row to enable row check
        if (item!={}) {
            row.id = "row-"+item[this.dom.values.system]+"-"+item[this.dom.values.tiers]+"-"+item[this.dom.values.category];
        }
        //Loop through class names in dom
        for(let v in this.dom.values){
            if(v) {
                let elem = row.getElementsByClassName(this.dom.values[v])[0]; //Check if element exists in the table
                if (elem) {
                    //Check and fill item table
                    if (item != {}) {
                        //Check type of input
                        if (this.dom.values[v] == "swapto" && item[this.dom.values[v]].length!=undefined) {
                            FILLselect(elem, item[this.dom.values[v]]);
                        } else {
                          //has start value
                          FILLselect(elem,this.GETswaptoitems(item.options.category));
                          for(let z=0;elem.children.length;x++){
                            if(elem.children[z].value===item[this.dom.values[v]]){elem.selectedIndex=z;}
                          }
                          //default to item.swapto
                            elem.innerText = item[this.dom.values[v]]
                        }
                    } else {
                        elem.innerText = '';//data[0][v]
                    }

                    //Event listener for change of swapto dropdown
                    if (elem.className == "swapto") {
                        elem.addEventListener('change', (ele)=>{
                          //system.value
                          //tier.value
                          if(item.options){
                            this.quote.info.build.systems[item.options.system].tiers[item.options.tier].size[item.options.category] = elem.value;
                            console.log(this.quote.info.build.systems[item.options.system].tiers[item.options.tier].size);
                          }
                        })
                    }
                }
            }
        }

        return row;
    }

    GETrow(){
      return item //{}
    }

    REFRESHdroplists(build,cats=false){
      console.log(build);
      this.quote = build;
      //get systems
      for(let x=0;x<build.info.build.systems.length;x++){
        this.droplists.systems.push({
          text:build.info.build.systems[x].name,
          value:x
        });
      }
      if(cats){
        for(let x=0;x<this.droplists.categories.length;x++){
          for(let y=0;y<build.info.key.accessories.length;y++){
            if(build.info.key.accessories[y].cat===this.droplists.categories[x].text && build.info.key.accessories[y].model!=''){
              this.droplists.categories[x].list.push({
                text:build.info.key.accessories[y].model,
                value:build.info.key.accessories[y].model
              });
            }
          }
        }
      }//setup categories

      //updates this.droplists
      console.log(this.droplists);
      //FILL SYSTEMS
      FILLselect(document.getElementById(this.dom.addrow.system), this.droplists.systems, true);
      //FILL TIERS
      FILLselect(document.getElementById(this.dom.addrow.tier), this.droplists.tiers, true);
      //FILL CATEGORIES
      FILLselect(document.getElementById(this.dom.addrow.category), this.droplists.categories);

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
      return this.quote.info.build.systems[system].tiers[tier].size[category];
    }

    /*Creates a row element.*/
    CREATErow(){
        //Define select variables
        let SystemSelectInput = document.getElementById(this.dom.addrow.system);
        let SystemSelection = SystemSelectInput[SystemSelectInput.selectedIndex];
        let TierSelectInput = document.getElementById(this.dom.addrow.tier);
        let TierSelection = TierSelectInput[TierSelectInput.selectedIndex];
        let CategorySelectInput = document.getElementById(this.dom.addrow.category);
        let CategorySelection = CategorySelectInput[CategorySelectInput.selectedIndex];
        //Create row only if values aren't left empty
        if (TierSelection.value == "" || SystemSelection.value == "" || CategorySelection.value == "") {
            console.log("Can't be blank!")
        } else {
            let NewItem = {
                system:SystemSelection.text,
                tiers:TierSelection.text,
                category:CategorySelection.text,
                swap:this.GETswapitem(
                    SystemSelection.value,
                    TierSelection.value,
                    CategorySelection.value,
                ),
                swapto:this.GETswaptoitems(CategorySelection.value), //Here goes the list of options you want to swap to
                options:{system:SystemSelection.value,tier:TierSelection.value,category:CategorySelection.value}
            }
            //Check for row, then add if not already added
            let RowCheck = document.getElementById("row-"+NewItem[this.dom.values.system]+"-"+NewItem[this.dom.values.tiers]+"-"+NewItem[this.dom.values.category])
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
