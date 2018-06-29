import { connect } from 'dva';


function confirm(props){
    if(props.pageState == "save"){ 
        const data = props.children
        let result = {}
        let form = []
        for(let i=0;i<data.length;i++){
            if(data[i].key){
                if(data[i].props.dataSource){
                    result[data[i].key] = data[i].props.dataSource.map(
                        item => {
                            if(item.id){
                                let {id,...value} = item
                                return [1,id,{...value}]
                            }else{
                                let {id,...value} = item
                                return [0,0,{...value}]
                            }
                        }
                    )
                }
                else{
                    continue
                }
            }
            if(i == data.length-1){
                for(let i=0;i<data.length;i++){
                    if(data[i].props.dataSource){
                        props.oldValue[data[i].key+"_arr"].forEach(element => {
                            if(!data[i].props.dataSource.some(item=>item.id==element)){
                                result[data[i].key].push([2,element])
                            }
                        });
                    }
                    if(i == data.length-1){
                        if(props.form){
                            if(props.custom){
                                props.custom.map(item=>{
                                    result[item.key] = item.fun(props.form.getFieldValue(item.key),props.oldValue[item.key])
                                })
                            }
                            result = Object.assign(result,{callback:props.callback,method:props.method,model:props.model,user_id:Number(window.localStorage.getItem("userId")),id:props.id,...props.form.getFieldsValue(props.field)})
                            // props.custom[0].fun(props.form.getFieldValue(props.custom[0].key),props.oldValue[props.custom[0].key])
                        }else{
                            result = Object.assign(result,{callback:props.callback,method:props.method,model:props.model,user_id:Number(window.localStorage.getItem("userId")),id:props.id})
                        }
                        props.dispatch({
                            type:"global/sendForm",
                            payload:{result}
                        })
                    }
                }
            }
        }
    }
    else if(props.pageState == "preview"&&!props.loading.global&&!props.oldValue){
        const data = props.children
        let result = {}
        let option = []
        for(let i=0;i<data.length;i++){
            if(data[i].key&&data[i].props.dataSource){
                result[data[i].key] = data[i].props.dataSource
                result[data[i].key+"_arr"] = data[i].props.dataSource.length?
                                                data[i].props.dataSource.map(item=>item.id)
                                                :
                                                []
                option = data[i].props.columns
            }
            if(i == data.length-1){
                if(props.custom){
                    var formArr = props.custom.map(item=>item.key)
                    result = Object.assign(result,{...props.form.getFieldsValue(formArr)})
                }
                props.dispatch({
                    type:"global/save",
                    payload:{oldValue:result,option}
                })
            }
        }
    }
    else{
        return
    }
    
}


function main(props) {
    console.log("logic",props)
    confirm(props)
    return (
        <div>
            {props.children}
        </div>
    )
}

function mapStateToProps(state) {
    const { loading } = state
    const { pageState,oldValue } = state.global;
    return { pageState,oldValue,loading }
}



const Main = connect(mapStateToProps)(main);

export default Main