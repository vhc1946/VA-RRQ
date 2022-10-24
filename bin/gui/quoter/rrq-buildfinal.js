const  path = require('path');
var {aappuser} = require('../../repo/ds/users/vogel-users.js');
const { findSourceMap } = require('module');
const dateConverter = require('xlsx-populate/lib/dateConverter.js');
const { contextIsolated } = require('process');
var auser = aappuser();

var {CREATEcontract}=require('../../repo/apps/rrq/rrq-contractIO.js');

var CREATEfinal=(quote,sysnum,pnum,optnum,newgrp)=>{
  console.log(CREATEcontract(quote,sysnum,pnum,optnum,newgrp));
  return CREATEcontract(quote,sysnum,pnum,optnum,newgrp);
}

module.exports={
    CREATEfinal
  }
