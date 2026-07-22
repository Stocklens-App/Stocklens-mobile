import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';


export default function PersonalDetailsScreen({ navigation }) {
  const { colors } = useTheme();
const styles = createStyles(colors);

  const [userName, setUserName] = useState('User');
  const [email, setEmail] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {

    const loadDetails = async () => {

      const savedName = await AsyncStorage.getItem('userName');

      const savedEmail = await AsyncStorage.getItem('email');
const savedPhone = await AsyncStorage.getItem('phone');

if(savedPhone){
  setPhoneNumber(savedPhone);
}

      if(savedName){
        setUserName(savedName);
      }


      if(savedEmail){
        setEmail(savedEmail);
      }

    };


    loadDetails();

  }, []);



  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        Personal Details
      </Text>


      <View style={styles.card}>


        <Text style={styles.label}>
          Full Name
        </Text>

        <Text style={styles.value}>
          {userName}
        </Text>

<Text style={styles.label}>
Phone Number
</Text>

<Text style={styles.value}>
{phoneNumber || "Not added"}
</Text>

        <Text style={styles.label}>
          Email Address
        </Text>

        <Text style={styles.value}>
          {email || 'Not available'}
        </Text>
        <TouchableOpacity
  style={styles.editButton}
  onPress={() => navigation.navigate('EditProfile')}
>

<Text style={styles.editText}>
  Edit Profile
</Text>

</TouchableOpacity>
        



      </View>


      <View style={styles.card}>


        <Text style={styles.label}>
          Account Type
        </Text>

        <Text style={styles.value}>
          Investor
        </Text>



        <Text style={styles.label}>
          Member Since
        </Text>

        <Text style={styles.value}>
          July 2026
        </Text>


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
  padding:18,
  marginBottom:20
},


label:{
  color:colors.textSecondary,
  fontSize:13,
  marginBottom:5
},


value:{
  color:colors.textMain,
  fontSize:17,
  fontWeight:'600',
  marginBottom:20
}, 
editButton:{
  backgroundColor: colors.primary,
  paddingVertical:14,
  borderRadius:SIZES.radius,
  alignItems:'center',
  marginTop:10
},

editText:{
  color:'#fff',
  fontSize:16,
  fontWeight:'600'
},


});