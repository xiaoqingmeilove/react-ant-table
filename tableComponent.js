import React, { Component } from 'react';
import { Form,Input,Table } from 'antd';
var dataSourceObj = {}

function ergodicArr(newValue,oldValue,result={}){
  var finalArr = result
  function inner(newValue,oldValue){
    for(let i=0;i<newValue.length;i++){
      if(newValue[i]&&newValue[i].key&&newValue[i].key.indexOf("GET")!=-1){
        finalArr[newValue[i].key.split("_")[1]] = newValue[i].props.dataSource
        if(oldValue){
          // console.log("开始进入整理阶段",oldValue,newValue[i].props.dataSource)
          let keyName = newValue[i].key.split("_")[1]+"_odoo"
          let valueReady = JSON.parse(JSON.stringify(newValue[i].props.dataSource))
          let result = valueReady.map(item=>{
            if(oldValue.filter(child=>child.id==item.id)[0]){
              let {id,...rest} = item
              return [1,id,rest]
            }else{
              let {id,...rest} = item
              return [0,0,rest]
            }
          })
          for(let i=0;i<oldValue.length;i++){
            if(valueReady.filter(child=>child.id==oldValue[i].id)[0]){
              continue             
            }else{
              result.push([2,oldValue[i].id])
            }
          }
          finalArr[keyName] = result
          // console.log("yyyyyyy",result)
        }
      }else{
        if(newValue[i]&&newValue[i].props&&newValue[i].props.children){
          if(typeof (newValue[i].props.children) === 'object' && !isNaN(newValue[i].props.children.length)){
            var dom = newValue[i].props.children
          }else if(typeof (newValue[i].props.children) === 'string'|| typeof (newValue[i].props.children)=== 'function'){
            continue
          }else{
            var dom = [newValue[i].props.children]
          }
          inner(dom,oldValue)
        }else{
          continue
        }
      }
    }
  }
  inner(newValue,oldValue)
  return finalArr
}

export default (Target) => (props)=>{
  let func1 = Target.prototype['myFun']
  let func2 = Target.prototype['componentWillUnmount']      
  Target.prototype['myFun'] = function (...argus){
    // console.log("lllll",argus)
      // let temp = func1.apply(this,argus);//执行原有的逻辑
      const DOM = this._reactInternalFiber.child.memoizedProps
      if(typeof DOM.children === 'object' && !isNaN(DOM.children.length)){
        var domOperate = DOM.children
      }else{
        var domOperate = [DOM.children]
      }
      let resultObj = ergodicArr(domOperate,argus[0]?argus[0]:null)
      dataSourceObj = {...dataSourceObj,...resultObj}
      // console.log("成功调用",dataSourceObj)
  }
  Target.prototype['componentWillUnmount'] = function (...argus){
    dataSourceObj={}
    // let temp = func2.apply(this,argus);//执行原有的逻辑
    console.log("组件被销毁",dataSourceObj)
  }
  Target.prototype['getDataSourceObj'] = function (...argus){
    return dataSourceObj
  }
  return <Target {...props} />
}