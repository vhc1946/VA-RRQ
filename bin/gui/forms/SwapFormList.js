//import { FILLselect, FINDparentele } from "../repo/tools/vg-displaytools.js"
//import { wrdom, wotablerow, Categories, Tiers, Systems, SwapToExample } from "./Hardcodes.js"

var {FormList} = require('../../repo/tools/box/vhc-formlist.js');
var {FILLselect} = require('../../repo/gui/js/tools/vg-displaytools.js');
//CHANGES MADE TO OTHER FILES: Added 'FILLselect' to vg-displaytools.js

//TODO: Change system input to input, allow it to accept datalist
//TODO: Clarify what we are checking before adding input - currently, checks system+category combo
//TODO: Notify user of system already added

//TODO: extend FormList to utilize get/set .form (returns/accepts=[])

const Categories = [
    {
        text: "Controls",
        value: "Controls",
        list: [{},{},{}]
    }
]

const Systems = [
    {
        text: "Indoor",
        value: "sys1"
    },
    {
        text: "Outdoor",
        value: "sys2"
    }
]


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

        //Load already created data
        this.form = this.list;

        //Event listener for adding a new row
        this.cont.getElementsByClassName('add-row')[0].addEventListener('click', (eve)=>{
            //Grab inputs and create an item
            let SystemSelectInput = document.getElementById('system-select');
            let TierSelectInput = document.getElementById('tier-select');
            let CategorySelectInput = document.getElementById('category-select');
            let NewItem = {
                system:SystemSelectInput[SystemSelectInput.selectedIndex].text,
                tiers:TierSelectInput[TierSelectInput.selectedIndex].text,
                category:CategorySelectInput[CategorySelectInput.selectedIndex].text,
                swap:this.GETswapitem(
                  SystemSelectInput[SystemSelectInput.selectedIndex].value,
                  TierSelectInput[TierSelectInput.selectedIndex].value,
                  CategorySelectInput[CategorySelectInput.selectedIndex].value,
                ),
                swapto:this.GETswaptoitems(CategorySelectInput[CategorySelectInput.selectedIndex].value) //Here goes the list of options you want to swap to
            }

            //Check for row, then add if not already added
            let RowCheck = document.getElementById("row-"+NewItem[this.dom.values.system]+"-"+NewItem[this.dom.values.tiers]+"-"+NewItem[this.dom.values.category])
            if (!RowCheck) {
                this.list.push(NewItem);
                this.ADDitem(NewItem);
            }
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
      }
    }
    INITcontent(){return`
    <div class='fl-list' id = 'table-cont'>

    </div>
    <div class = 'fl-header' id="input-cont">
        <select class = "bottom-select" id = "system-select"></select>
        <select class = "bottom-select" id = "tier-select"></select>
        <select class = "bottom-select" id = "category-select"></select>
        <div class = "action-button add-row">Add Input</div>
    </div>
    `};

    rowcontent=`
        <div class = "${this.dom.values.system}"></div>
        <div class = "${this.dom.values.tiers}"></div>
        <div class = "${this.dom.values.category}"></div>
        <div class = "${this.dom.values.swap}"></div>
        <select class = "${this.dom.values.swapto}"><select>
    `

    SETrow(item={}){
        let row = document.createElement('div');
        row.classList.add('form-row');
        row.innerHTML=this.rowcontent;

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
                        if (this.dom.values[v] == "swapto" && elem.tagName == "SELECT") {
                            FILLselect(elem, item[this.dom.values[v]]);
                        } else {
                            elem.innerText = item[this.dom.values[v]]
                        }
                    } else {
                        elem.innerText = data[0][v]
                    }

                    //Event listener for change of swapto dropdown
                    if (elem.className == "swapto") {
                        elem.addEventListener('change', (eve)=>{
                            console.log("Changed SwapTo Dropdown to", elem[elem.selectedIndex].text)
                        })
                    }
                }
            }
        }

        return row;
    }

    GETrow(){

    }

    REFRESHdroplists(build,cats=false){
      console.log(build);
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
      FILLselect(document.getElementById('system-select'), this.droplists.systems);
      //FILL TIERS
      FILLselect(document.getElementById('tier-select'), this.droplists.tiers);
      //FILL CATEGORIES
      FILLselect(document.getElementById('category-select'), this.droplists.categories);

    }


    GETswaptoitems(category){
      return SwapToExample;
    }
    GETswapitem(system,tier,category){
      return 'model number';
    }

}

module.exports={
  SwapTable
}
