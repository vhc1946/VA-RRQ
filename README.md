Residential Replacement Quoter



repo/gui/styles/vg-elec-menu.css
repo/gui/styles/vg-tables.css
repo/gui/login/login.js

-Price Key-
-Users-
-Dashboard-
-Build-
-Presentation-

PRICE KEY
The current price book has been altered slightly in order to be read into the program
and stored as a .json file. The call to do so is made from the client side by those
with access. The key, now saved to a .json file, is stored in the Res HVAC SharePoint
library and is accessible by all users when creating new quotes. The structure of
the key is as follows.

{ *File location - /rrq/pricekey.json
  date : Date()
  key : {
    accesories:{
      iaq:[],
      ...[]
    }
    groups{
      'SYS Group Name' : {
        optheads : {
          {
            size: 'Size',
            outmodel: 'AC Model',
            inmodel: 'Furn Model',
            innmodel: 'Evap Model',
            statmodel: 'Stat Model',
            instheight: 'install Height',
            ahri: 'AHRI Number',
            a: 'A',
            btucooling: 'Cooling BTUs',
            seer: 'SEER',
            eer: 'EER',
            syseffic: 'AFUE / HSPF',
            rebateelec: 'Ameren Rebate',
            rebategas: 'Spire Rebate',
            creditfedtax: 'Fed Tax Credit',
            pricebase: 'Base Price',
            pricenet: 'Net Price'
          }
        }
        tiers : {
          [
            {
              info : { //holds the tier/system info for the tier option.
                tierid: 'T4',
                sysid: 'C4',
                outseries: 'CA14',
                inseries: 'SC5',
                innseries: 0,
                mfg: 'Carrier',
                outstages: 1,
                instages: 1,
                syseffic: 95,
                installhours: 19,
                otherhours: 2,
                totalhours: 21,
                discinstnt: 600,
                discmfg: 0,
                discspcl: 0,
                warrparts: 10,
                warrlab: 2,
                syspiccode: 'CS05',
                feat_demandhumid: 0,
                feat_enhandehumid: 0,
                feat_varispdblower: 0,
                feat_higheffblower: 'Yes',
                feat_multistgheating: 0,
                feat_multistgcooling: 0,
                feat_soundblanket: 0,
                feat_quietcondfan: 0,
                feat_varispdcomp: 0,
                enhnc_mainagrrement: 'Yes',
                enhnc_surgeprotct: 'Yes',
                enhnc_4filter: 0
              }
              opts : [ // opts array holds all of the different match-ups for a given tiers
                {
                  size: '1.5 / 40',
                  outmodel: 'CA14NA01800L',
                  inmodel: '59SC5B040E14--10',
                  innmodel: 'CNPVP1814ALA',
                  statmodel: 'TH6210U2001',
                  instheight: 47.63,
                  ahri: 203697610,
                  a: '',
                  btucooling: 17100,
                  seer: 15,
                  eer: 12.5,
                  syseffic: 96,
                  rebateelec: 250,
                  rebategas: 325,
                  creditfedtax: '',
                  pricebase: 9590.767522151671,
                  pricenet: 8740.767522151671
                }
              ]
            }
          ]
        }
      }
    }
  }
}

To refresh the key a manager/admin navigates to the SETTINGS portion of the program.
