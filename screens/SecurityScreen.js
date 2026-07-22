import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function SecurityScreen({navigation}){
  const { colors } = useTheme();
const styles = createStyles(colors);


const [pinEnabled, setPinEnabled] = useState(false);
useEffect(()=>{


const checkPin = async()=>{


const savedPin = await AsyncStorage.getItem('appPin');


if(savedPin){

setPinEnabled(true);

}else{

setPinEnabled(false);

}


};


checkPin();


},[]);
  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Security
      </Text>


      <View style={styles.card}>


        <Text style={styles.sectionTitle}>
          Account Security
        </Text>


       <TouchableOpacity 
  style={styles.row}
  onPress={() => navigation.navigate('ChangePassword')}
>


          <Text style={styles.icon}>
            🔑
          </Text>


          <Text style={styles.rowText}>
            Change Password
          </Text>


          <Text style={styles.arrow}>
            ›
          </Text>


        </TouchableOpacity>



       <TouchableOpacity
style={styles.row}
onPress={()=>navigation.navigate('Biometric')}
>

          <Text style={styles.icon}>
            👆
          </Text>


          <Text style={styles.rowText}>
            Fingerprint / Face ID
          </Text>


          <Text style={styles.arrow}>
            ›
          </Text>


        </TouchableOpacity>



    <TouchableOpacity
style={styles.row}
onPress={() => navigation.navigate('SetPin')}
>


<Text style={styles.icon}>
🔢
</Text>



<View style={{flex:1}}>

<Text style={styles.rowText}>
App PIN Lock
</Text>


<Text style={styles.statusText}>
{
pinEnabled
?
"Enabled ✅"
:
"Not Set"
}
</Text>


</View>



<Text style={styles.arrow}>
›
</Text>


</TouchableOpacity>

      </View>


    </View>

  );

}


const createStyles = (colors) => StyleSheet.create({

container:{
  flex:1,
  backgroundColor:colors.background,
  padding:SIZES.padding,
  paddingTop:60
},


title:{
  color:colors.textMain,
  fontSize:28,
  fontWeight:'bold',
  marginBottom:25
},


card:{
  backgroundColor:colors.surface,
  borderRadius:16,
  padding:15
},


sectionTitle:{
  color:colors.textSecondary,
  fontSize:14,
  marginBottom:15
},


row:{
  flexDirection:'row',
  alignItems:'center',
  paddingVertical:18
},


icon:{
  fontSize:22,
  width:45
},


rowText:{
  flex:1,
  color:colors.textMain,
  fontSize:16
},
statusText:{
color:colors.textSecondary,
fontSize:13,
marginTop:3
},

arrow:{
  color:colors.textSecondary,
  fontSize:28
}


});