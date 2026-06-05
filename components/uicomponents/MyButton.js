import { View ,Text,Dimensions, TouchableOpacity} from "react-native"
const {width,height} = Dimensions.get('window')
export default function MyButton({msg,w=0.9,bg='green',onPress=()=>{}})
{
    return(
        // onPress ka Refrence APP.JS ME TRANSFER KAR DIYA !!
        <TouchableOpacity onPress={onPress}>
        <View style={{marginTop:10,width:width*w,height:55,backgroundColor:'green',borderRadius:5,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:22,letterSpacing:1,color:'#fff'}}>{msg}</Text>
        </View>
        </TouchableOpacity>
    )
}