import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../theme';


import AsyncStorage from '@react-native-async-storage/async-storage';
export default function ProfileScreen({ navigation, onLogout }) {
  

  const { colors, darkMode, toggleTheme } = useTheme();

  const styles = createStyles(colors);

  const [userName, setUserName] = useState('User');

useEffect(() => {

    const loadUser = async () => {

      const savedName = await AsyncStorage.getItem('userName');
console.log("PROFILE STORED NAME:", savedName);
      if(savedName){
        setUserName(savedName);
      }

    };

    loadUser();

  }, []);
const handleLogout = () => {
  if (onLogout) {
    onLogout();
  }
};


return (

<View style={styles.container}>


<Text style={styles.titleText}>
My Profile
</Text>


<Text style={styles.email}>
Welcome, {userName}
</Text>



{/* ACCOUNT SECTION */}

<View style={styles.card}>


<Text style={styles.sectionTitle}>
Account
</Text>


<TouchableOpacity 
  style={styles.row}
  onPress={() => navigation.navigate('PersonalDetails')}
>

<Text style={styles.icon}>
👤
</Text>

<Text style={styles.rowText}>
Personal Details
</Text>

<Text style={styles.arrow}>
›
</Text>


</TouchableOpacity>



<TouchableOpacity
  style={styles.row}
  onPress={() => navigation.navigate('Security')}
>

<Text style={styles.icon}>
🔒
</Text>

<Text style={styles.rowText}>
Security
</Text>

<Text style={styles.arrow}>
›
</Text>

</TouchableOpacity>


</View>




{/* SETTINGS SECTION */}


<View style={styles.card}>


<Text style={styles.sectionTitle}>
Preferences
</Text>



<View style={styles.row}>


<Text style={styles.icon}>
🌙
</Text>


<Text style={styles.rowText}>
Dark Mode
</Text>


<Switch
  value={darkMode}
  onValueChange={toggleTheme}
/>

</View>



<TouchableOpacity
style={styles.row}
onPress={() => navigation.navigate('Notifications')}
>


<Text style={styles.icon}>
🔔
</Text>


<Text style={styles.rowText}>
Notifications
</Text>


<Text style={styles.arrow}>
›
</Text>


</TouchableOpacity>



</View>





<TouchableOpacity
style={styles.logoutButton}
onPress={handleLogout}
>

<Text style={styles.logoutText}>
Log Out Account
</Text>


</TouchableOpacity>



</View>

);

}


const createStyles = (colors) => StyleSheet.create({

container:{
flex:1,
backgroundColor: colors.background,
padding:SIZES.padding,
paddingTop:60
},


titleText:{
color: colors.textMain,
fontSize:28,
fontWeight:'bold',
marginBottom:8
},


email:{
color: colors.textSecondary,
fontSize:15,
marginBottom:30
},



card:{
backgroundColor: colors.surface,
borderRadius:16,
padding:15,
marginBottom:20
},



sectionTitle:{
color: colors.textSecondary,
fontSize:14,
fontWeight:'600',
marginBottom:15
},



row:{
flexDirection:'row',
alignItems:'center',
paddingVertical:15
},



icon:{
fontSize:22,
width:40
},



rowText:{
flex:1,
color: colors.textMain,
fontSize:16
},



arrow:{
color:colors.textSecondary,
fontSize:28
},



logoutButton:{
backgroundColor:colors.error,
paddingVertical:14,
borderRadius:SIZES.radius,
alignItems:'center',
marginTop:20
},



logoutText:{
color:'#fff',
fontSize:16,
fontWeight:'600'
}


});