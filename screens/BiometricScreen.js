import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';



export default function BiometricScreen(){
  
 const { colors } = useTheme();

  const styles = createStyles(colors);

const [available, setAvailable] = useState(false);

const [enabled, setEnabled] = useState(false);

const [biometricType, setBiometricType] = useState("Biometric");




useEffect(()=>{


const checkBiometric = async()=>{


const compatible =
await LocalAuthentication.hasHardware();


const enrolled =
await LocalAuthentication.isEnrolledAsync();
const types =
await LocalAuthentication.supportedAuthenticationTypesAsync();


if(types.includes(1)){

  setBiometricType("Fingerprint");

}
else if(types.includes(2)){

  setBiometricType("Face ID");

}


const saved =
await AsyncStorage.getItem('biometricEnabled');



if(compatible && enrolled){

setAvailable(true);

}



if(saved === "true"){

setEnabled(true);

}


};


checkBiometric();


},[]);






const enableBiometric = async()=>{


const result =
await LocalAuthentication.authenticateAsync({

promptMessage:
"Confirm fingerprint or face ID"

});



if(result.success){


await AsyncStorage.setItem(
'biometricEnabled',
'true'
);


setEnabled(true);



Alert.alert(
"Success",
"Biometric login enabled"
);


}


};







const disableBiometric = async()=>{


await AsyncStorage.removeItem(
'biometricEnabled'
);


setEnabled(false);


Alert.alert(
"Disabled",
"Biometric login disabled"
);


};







return (

<View style={styles.container}>


<Text style={styles.title}>
{biometricType}
</Text>


<View style={styles.card}>


<Text style={styles.label}>
Status
</Text>


<Text style={styles.value}>

{
available
?
`${biometricType} Available`
:
"Not available on this device"
}

</Text>



<TouchableOpacity

style={styles.button}

onPress={
enabled
?
disableBiometric
:
enableBiometric
}

disabled={!available}

>


<Text style={styles.buttonText}>

{
enabled
?
"Disable Biometrics"
:
"Enable Biometrics"
}

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

fontSize:13

},



value:{

color:colors.textMain,

fontSize:17,

fontWeight:'600',

marginVertical:20

},



button:{

backgroundColor:colors.primary,

paddingVertical:14,

borderRadius:SIZES.radius,

alignItems:'center'

},



buttonText:{

color:'#fff',

fontSize:16,

fontWeight:'600'

}



});