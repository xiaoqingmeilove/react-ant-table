export async function changeLogic(arr,obj,key,type){
    if(type == "del"){      
        arr.splice(key,1)
        return arr
    }else if(type == "edit"){
        arr[key] = {...obj.old,...obj.new}
        return arr
    }
}