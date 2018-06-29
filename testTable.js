import React, { Component } from 'react';
import { Form,Input,Table, Modal, Select, Button, InputNumber, Radio } from 'antd';
import WrapperHello from './tableComponent.js';
import {changeLogic} from './changeLogic.js'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};
class table extends Component {
    constructor(p){
        super(p);
        this.state = {
          editState:false,
          dataSource: [],
          globalDataSource:undefined,
          visible:false,
          check:{},
          page:1,
          index:0,
        };
    }

    componentWillReceiveProps(nextProps){
      var self = this
      if(!nextProps.editState&&nextProps.dataSource){
        console.log("props变化开始运行",nextProps)
        let temp = JSON.parse(JSON.stringify(nextProps.dataSource))
        this.setState({
          globalDataSource:temp,
          dataSource:nextProps.dataSource,
          editState:nextProps.editState
        })
        setTimeout(function(){self.myFun(self.state.globalDataSource)},0)
      }else{
        this.setState({
          dataSource:nextProps.dataSource,
          editState:nextProps.editState
        })
      }
    }

    row(payload){
      if(payload.check){
        let {id,...rest} = payload.check
        this.props.form.setFieldsValue({...rest})
        this.setState({check:payload.check,visible:payload.visible})
      }else{
        this.props.form.resetFields()
        this.setState({check:{},visible:payload.visible})
      } 
    }


    changeData(obj){
      let self = this
      let {dataSource,check,page,index} = this.state
      changeLogic(dataSource,{old:check,new:obj.dataSource},((page-1)*10)+index,"edit").then(function(result){
        self.setState({
          dataSource:result,
          visible:obj.visible
        })
      })
    }

    deleteData(obj){
      let self = this
      let {dataSource,check,page,index} = this.state
      changeLogic(dataSource,obj.dataSource,((page-1)*10)+obj.index,"del").then(function(result){
        self.setState({
          dataSource:result,
        })
      })
    }

    addData(obj){
      let self = this
      let {dataSource,check,page,index} = this.state
      dataSource.push(obj.dataSource)
      this.setState({
        dataSource:dataSource,
        visible:obj.visible
      })
    }



    componentDidUpdate(props){
      // console.log("重启真实DOM",this.state.globalDataSource)
      this.myFun(this.state.globalDataSource)
    }


    makeColumns(props){
      let self = this
      let columns = props.columns
      let result = []
      for(let i=0;i<columns.length;i++){
        if(columns[i].key=="option"&&columns[i].title=="操作"){
          result.push(
            {
              title: columns[i].title,
              dataIndex: columns[i].dataIndex,
              key: columns[i].key,
              render:(text, record, index)=>{
                return columns[i].editType.map(child=>{
                  if(child == 'DEL'&&props.editState){
                    return <Button key={"DEL"+Math.floor(1000*Math.random())} onClick={()=>{
                      self.deleteData({record,index})
                    }}>删除</Button>
                  }else{
                    return <span key={"SPA"+Math.floor(1000*Math.random())}></span>
                  }
                })
              }
            }
          )
          continue
        }
        if(columns[i].thead){
          if(columns[i].renderAction){
            result.push(
              {
                title: columns[i].title,
                dataIndex: columns[i].dataIndex,
                key: columns[i].key,
                onCell:(record) => {
                    return {
                      onClick: ()=>self.row({visible:true,check:record})
                    };
                },
                render:(text, record, index)=>{
                  return columns[i].renderAction(text, record, index,props[columns[i].key])
                }
              }
            )
          }else{
            result.push(
              {
                title: columns[i].title,
                dataIndex: columns[i].dataIndex,
                key: columns[i].key,
                onCell:(record) => {
                    return {
                      onClick: ()=>self.row({visible:true,check:record})
                    };
                  }
                }
            )
          }
        }else{
          continue
        }
      }
      return result
    }

    render(){
        const { getFieldDecorator } = this.props.form;
        let self = this
        let columns = this.makeColumns(this.props)
        return (
          <div>
            <Button onClick={()=>{self.row({visible:true})}} style={{display:self.state.editState?"":"none"}}>新建</Button>
            <Table 
              dataSource={this.state.dataSource} 
              columns={columns} 
              key={this.props.keyValue}
              rowKey={(record)=>record.id?record.id:Math.floor(1000*Math.random())}
              onChange={(pagination)=>{
                self.setState({
                  page:pagination
                })  
              }}
              onRow={(record,index) => {
                return {
                  onClick: () => {
                    self.setState({
                      index:index
                    })
                  },
                }
              }}
            />
            <Modal
              title={
                !self.state.editState?
                "详情"
                :
                Object.getOwnPropertyNames(self.state.check).length?
                "编辑"
                :
                "新增"
              }
              visible={this.state.visible}
              onCancel={()=>{
                this.setState({
                  visible:false
                })
              }}
              onOk={()=>{
                Object.getOwnPropertyNames(self.state.check).length?
                self.changeData({visible:false,dataSource:{...self.props.form.getFieldsValue()}})
                :
                self.addData({visible:false,dataSource:{...self.props.form.getFieldsValue()}})
              }}
            >
              <Form>
                {function(){
                  return self.props.columns.map((item)=>{
                    if(item.editType === "INPUT"){
                      return <FormItem
                                  label={item.title}
                                  {...formItemLayout}
                                  key={item.title}
                              >
                                  {getFieldDecorator(item.key, {
                                      
                                  })(
                                      self.state.editState?
                                          <Input  onChange={(value)=>{
                                            return item.monitoringFun?
                                            item.monitoringFun(value,self.props.form)
                                            :
                                            false
                                          }}/>
                                          :
                                          <p>{self.state.check[item.key]}</p>
                                  )}
                              </FormItem>
                    }else if(item.editType === "INPUTNUMBER"){
                      return <FormItem
                                  label={item.title}
                                  {...formItemLayout}
                                  key={item.title}
                              >
                                  {getFieldDecorator(item.key, {
                                      
                                  })(
                                    self.state.editState?
                                          <InputNumber  onChange={(value)=>{
                                            return item.monitoringFun?
                                            item.monitoringFun(value,self.props.form)
                                            :
                                            false
                                          }}/>
                                          :
                                          <p>{self.state.check[item.key]}</p>
                                  )}
                              </FormItem>
                    }else if(item.editType === "RADIO"){
                      return <FormItem
                                  label={item.title}
                                  {...formItemLayout}
                                  key={item.title}
                              >
                                  {getFieldDecorator(item.key, {
                                      
                                  })(
                                    self.state.editState?
                                          <RadioGroup onChange={(value)=>{
                                            return item.monitoringFun?
                                            item.monitoringFun(value,self.props.form)
                                            :
                                            false
                                          }}>
                                            {function(){
                                              if(item.editAction&&item.editAction.mode === "ARR"){
                                                return item.editAction.specific.map(child=>{
                                                  return <Radio value={child.key} key={child.key}>{child.value}</Radio>
                                                })
                                              }else if(item.editAction&&item.editAction.mode === "FUN"){
                                                let temp = item.editAction.specific(self.props[item.key])
                                                return temp.map(child=>{
                                                  return <Radio value={child.key} key={child.key}>{child.value}</Radio>
                                                })
                                              }else{
                                                return []
                                              }
                                            }()}
                                          </RadioGroup>
                                          :
                                          <p>{function(){
                                            if(item.editAction&&item.editAction.mode === "ARR"){
                                              return (item.editAction.specific.filter(child=>child.key==self.state.check[item.key]))[0]?
                                              (item.editAction.specific.filter(child=>child.key==self.state.check[item.key]))[0].value:""
                                            }else if(item.editAction&&item.editAction.mode === "FUN"){
                                              let temp = item.editAction.specific(self.props[item.key])
                                              return (temp.filter(child=>child.key==self.state.check[item.key]))[0]?
                                              (temp.filter(child=>child.key==self.state.check[item.key]))[0].value:""
                                            }else{
                                              return ""
                                            }
                                          }()}</p>
                                  )}
                              </FormItem>
                    }else if(item.editType === "SELECT"){
                      return <FormItem
                                  label={item.title}
                                  {...formItemLayout}
                                  key={item.title}
                              >
                                  {getFieldDecorator(item.key, {
                                      
                                  })(
                                    self.state.editState?
                                          <Select style={{ width: 200 }} onChange={(value)=>{
                                            console.log("nnnbb",value)
                                            return item.monitoringFun?
                                            item.monitoringFun(value,self.props.form)
                                            :
                                            false
                                          }}>
                                            {function(){
                                              if(item.editAction&&item.editAction.mode === "ARR"){
                                                return item.editAction.specific.map(child=>{
                                                  return <Option value={child.key} key={child.key}>{child.value}</Option>
                                                })
                                              }else if(item.editAction&&item.editAction.mode === "FUN"){
                                                let temp = item.editAction.specific(self.props[item.key])
                                                return temp.map(child=>{
                                                  return <Option value={child.key} key={child.key}>{child.value}</Option>
                                                })
                                              }else{
                                                return []
                                              }
                                            }()}
                                          </Select>
                                          :
                                          <p>{function(){
                                            if(item.editAction&&item.editAction.mode === "ARR"){
                                              return (item.editAction.specific.filter(child=>child.key==self.state.check[item.key]))[0]?
                                              (item.editAction.specific.filter(child=>child.key==self.state.check[item.key]))[0].value:""
                                            }else if(item.editAction&&item.editAction.mode === "FUN"){
                                              let temp = item.editAction.specific(self.props[item.key])
                                              return (temp.filter(child=>child.key==self.state.check[item.key]))[0]?
                                              (temp.filter(child=>child.key==self.state.check[item.key]))[0].value:""
                                            }else{
                                              return ""
                                            }
                                          }()}</p>
                                  )}
                              </FormItem>
                    }else if(item.editType === "MUTISELECT"){
                      return <FormItem
                      label={item.title}
                      {...formItemLayout}
                      key={item.title}
                  >
                      {getFieldDecorator(item.key, {
                          
                      })(
                        self.state.editState?
                              <Select style={{ width: 220 }} mode="multiple" onChange={(value)=>{
                                return item.monitoringFun?
                                item.monitoringFun(value,self.props.form)
                                :
                                false
                              }}>
                                {function(){
                                  if(item.editAction&&item.editAction.mode === "ARR"){
                                    return item.editAction.specific.map(child=>{
                                      return <Option value={child.key} key={child.key}>{child.value}</Option>
                                    })
                                  }else if(item.editAction&&item.editAction.mode === "FUN"){
                                    let temp = item.editAction.specific(self.props[item.key])
                                    return temp.map(child=>{
                                      return <Option value={child.key} key={child.key}>{child.value}</Option>
                                    })
                                  }else{
                                    return []
                                  }
                                }()}
                              </Select>
                              :
                              <div>
                                {function(){
                                  if(item.editAction&&item.editAction.mode === "ARR"){
                                    return self.state.check[item.key]&&self.state.check[item.key].length?
                                    self.state.check[item.key].map(child=>{
                                      return (item.editAction.specific.filter(inside=>inside.key==child))[0]?
                                      <p key={(item.editAction.specific.filter(inside=>inside.key==child))[0].value}>{(item.editAction.specific.filter(inside=>inside.key==child))[0].value}</p>
                                      :
                                      ""
                                    })
                                    :
                                    ""
                                  }else if(item.editAction&&item.editAction.mode === "FUN"){
                                    let temp = item.editAction.specific(self.props[item.key])
                                    return self.state.check[item.key]&&self.state.check[item.key].length?
                                    self.state.check[item.key].map(child=>{
                                      return (temp.filter(inside=>inside.key==child))[0]?
                                      <p key={(temp.filter(inside=>inside.key==child))[0].value}>{(temp.filter(inside=>inside.key==child))[0].value}</p>
                                      :
                                      ""
                                    })
                                    :
                                    ""
                                  }else{
                                    return ""
                                  }
                                }()}
                              </div>
                      )}
                  </FormItem>
                    }else{
                      return <span key={"p_"+Math.floor(1000*Math.random())}></span>
                    }
                  })
                }()}
              </Form>
            </Modal>
          </div>
      )
    }
}



table = WrapperHello(table)
export default Form.create()(table)
   