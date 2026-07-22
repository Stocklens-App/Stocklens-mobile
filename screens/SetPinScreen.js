import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';



export default function SetPinScreen({navigation}) {

  const { colors } = useTheme();

  const styles = createStyles(colors);


  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');



  const savePin = async () => {


    if(pin.length !== 4){

      Alert.alert(
        "Invalid PIN",
        "PIN must be exactly 4 digits"
      );

      return;

    }



    if(pin !== confirmPin){

      Alert.alert(
        "Error",
        "PINs do not match"
      );

      return;

    }



    await AsyncStorage.setItem(
      'appPin',
      pin
    );


    Alert.alert(
      "Success",
      "PIN created successfully"
    );


    navigation.goBack();


  };



return (

<View style={styles.container}>


<Text style={styles.title}>
Set App PIN
</Text>



<View style={styles.card}>


<Text style={styles.label}>
Create 4 digit PIN
</Text>


<TextInput
style={styles.input}
value={pin}
onChangeText={setPin}
keyboardType="number-pad"
maxLength={4}
secureTextEntry
placeholder="****"
placeholderTextColor={colors.textSecondary}
/>




<Text style={styles.label}>
Confirm PIN
</Text>


<TextInput
style={styles.input}
value={confirmPin}
onChangeText={setConfirmPin}
keyboardType="number-pad"
maxLength={4}
secureTextEntry
placeholder="****"
placeholderTextColor={colors.textSecondary}
/>




<TouchableOpacity
style={styles.button}
onPress={savePin}
>


<Text style={styles.buttonText}>
Save PIN
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
padding:18
},


label:{
color:colors.textSecondary,
fontSize:14,
marginBottom:8
},


input:{
backgroundColor:colors.background,
borderColor:colors.border,
borderWidth:1,
borderRadius:SIZES.radius,
padding:15,
color:colors.textMain,
fontSize:20,
letterSpacing:10,
textAlign:'center',
marginBottom:20
},


button:{
backgroundColor:colors.primary,
padding:15,
borderRadius:SIZES.radius,
alignItems:'center'
},


buttonText:{
color:'#fff',
fontSize:16,
fontWeight:'600'
}


});