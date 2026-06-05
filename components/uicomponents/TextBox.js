import {View,Text,TextInput,StyleSheet,Dimensions } from "react-native"
import Icon from "react-native-vector-icons/AntDesign"
import EIcon from 'react-native-vector-icons/Entypo'
import { useState } from "react"
// DESTRUCTING THE DIMENSION FOR PARTICULAR DEVICES !!

const{width,height}=Dimensions.get('window')



// const styles=StyleSheet.create({
//     container:{
//          }
// })

// {...props} IS USED FOR PROPERTIES JO USE NAHI HO SAKTI USSE USE KARNA !!
export default function TextBox({password=false,error=false,helperText='',icon,w=.9,msg='',type='text',...props}){
    const [color,setColor] = useState("grey")
    const [eyeIcon,setEyeIcon] = useState("eye")
    const [showPassword,setShowPassword] = useState(false)
    const handleEyeClick=()=>{

        if(!showPassword)
        {
        setEyeIcon('eye-with-line')
        setShowPassword(true)
        }
        else{
            setEyeIcon('eye')
        setShowPassword(false)
        }
    }

    return(
    <View>
    <View style={{alignItems:'center',flexDirection:'row',padding:2,width:width*w,borderWidth:1,borderColor:error?'#ff4757':color,backgroundColor:'#fff',marginTop:10}}>
        <Icon name={icon} size={25}/>

{/* OnFocus = when we click on the text box or other things it changes the color !! */}
{/* onBlur = if we click on the other box then the first will remain unchanged  !!*/}

<TextInput secureTextEntry={!showPassword} onFocus={()=>setColor('green')} onBlur={()=>setColor('grey')} {...props} style={{fontSize:18}} keyboardType={type} placeholder={msg}/>
   {password?<EIcon style={{marginLeft:'auto',padding:10}} name={eyeIcon} size={30} onPress={handleEyeClick}/>:<></>}
    </View>
    {error?<Text style={{color:'#ff4757'}}>{helperText}</Text>:<></>}
    </View>
    )
}