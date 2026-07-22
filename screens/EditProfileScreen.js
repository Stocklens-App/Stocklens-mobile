import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';



export default function EditProfileScreen({ navigation }) {


  const { colors } = useTheme();

  const styles = createStyles(colors);



  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');




  useEffect(() => {

    const loadDetails = async () => {

      const savedName = await AsyncStorage.getItem('userName');
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPhone = await AsyncStorage.getItem('phone');


      if(savedName){
        setUserName(savedName);
      }


      if(savedEmail){
        setEmail(savedEmail);
      }


      if(savedPhone){
        setPhoneNumber(savedPhone);
      }

    };


    loadDetails();

  }, []);






  const saveChanges = async () => {


    await AsyncStorage.setItem(
      'userName',
      userName
    );


    await AsyncStorage.setItem(
      'email',
      email
    );


    await AsyncStorage.setItem(
      'phone',
      phoneNumber
    );


    navigation.goBack();

  };







  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Edit Profile
      </Text>





      <Text style={styles.label}>
        Full Name
      </Text>



      <TextInput

        style={styles.input}

        value={userName}

        onChangeText={setUserName}

      />






      <Text style={styles.label}>
        Email Address
      </Text>



      <TextInput

        style={styles.input}

        value={email}

        onChangeText={setEmail}

      />






      <Text style={styles.label}>
        Phone Number
      </Text>



      <TextInput

        style={styles.input}

        value={phoneNumber}

        onChangeText={setPhoneNumber}

        keyboardType="phone-pad"

      />







      <TouchableOpacity

        style={styles.button}

        onPress={saveChanges}

      >


        <Text style={styles.buttonText}>
          Save Changes
        </Text>


      </TouchableOpacity>



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

  marginBottom:30

},





label:{

  color:colors.textSecondary,

  fontSize:13,

  marginBottom:6

},





input:{

  backgroundColor:colors.surface,

  color:colors.textMain,

  borderRadius:12,

  padding:15,

  marginBottom:20,

  borderWidth:1,

  borderColor:colors.border

},





button:{

  backgroundColor:colors.primary,

  paddingVertical:14,

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