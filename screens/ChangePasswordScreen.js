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

import api from '../context/axios';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';


export default function ChangePasswordScreen({navigation}) {
  const { colors } = useTheme();
const styles = createStyles(colors);


  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');




  const handleChangePassword = async () => {


    if(!oldPassword || !newPassword || !confirmPassword){

      Alert.alert(
        "Error",
        "Please fill all fields"
      );

      return;

    }



    if(newPassword !== confirmPassword){

      Alert.alert(
        "Error",
        "New passwords do not match"
      );

      return;

    }



    try {


      const email = await AsyncStorage.getItem('email');



      const response = await api.put(
        '/api/auth/change-password',
        {

          email: email,
          oldPassword: oldPassword,
          newPassword: newPassword

        }
      );



      if(response.data.error){

        Alert.alert(
          "Failed",
          response.data.error
        );

        return;

      }



      Alert.alert(
        "Success",
        "Password changed successfully"
      );


      navigation.goBack();



    } catch(error){


      console.log(
        "CHANGE PASSWORD ERROR:",
        error.response?.data || error.message
      );


      Alert.alert(
        "Error",
        "Something went wrong"
      );


    }


  };




return (

<View style={styles.container}>


<Text style={styles.title}>
Change Password
</Text>



<View style={styles.card}>


<TextInput
style={styles.input}
placeholder="Current Password"
placeholderTextColor={colors.textSecondary}
secureTextEntry
value={oldPassword}
onChangeText={setOldPassword}
/>



<TextInput
style={styles.input}
placeholder="New Password"
placeholderTextColor={colors.textSecondary}
secureTextEntry
value={newPassword}
onChangeText={setNewPassword}
/>



<TextInput
style={styles.input}
placeholder="Confirm New Password"
placeholderTextColor={colors.textSecondary}
secureTextEntry
value={confirmPassword}
onChangeText={setConfirmPassword}
/>



<TouchableOpacity
style={styles.button}
onPress={handleChangePassword}
>


<Text style={styles.buttonText}>
Update Password
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
padding:18,
borderRadius:16
},



input:{
backgroundColor:colors.background,
borderWidth:1,
borderColor:colors.border,
borderRadius:SIZES.radius,
padding:14,
color:colors.textMain,
marginBottom:15
},



button:{
backgroundColor:colors.primary,
padding:15,
borderRadius:SIZES.radius,
alignItems:'center',
marginTop:10
},



buttonText:{
color:'#fff',
fontSize:16,
fontWeight:'600'
}


});