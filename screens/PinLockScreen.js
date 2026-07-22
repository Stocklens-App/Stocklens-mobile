import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';



export default function PinLockScreen({ onUnlock }) {
  const { colors } = useTheme();
const styles = createStyles(colors);


  const [pin, setPin] = useState('');



  const handleUnlock = async () => {


    const savedPin = await AsyncStorage.getItem('appPin');



    if(pin === savedPin){


      setPin('');

      Keyboard.dismiss();


      if(onUnlock){
        onUnlock();
      }


    } else {


      Alert.alert(
        "Incorrect PIN",
        "Wrong PIN. Try again."
      );


      setPin('');

    }


  };

const handleForgotPin = async () => {

  await AsyncStorage.removeItem('appPin');


  Alert.alert(
    "PIN Reset",
    "Your PIN has been removed. Please create a new PIN."
  );


  if(onUnlock){
    onUnlock();
  }

};

  return (


<TouchableWithoutFeedback
onPress={Keyboard.dismiss}
>


<KeyboardAvoidingView

style={styles.container}

behavior={
Platform.OS === "ios"
? "padding"
: "height"
}

>



      <Text style={styles.logo}>
        StockLens
      </Text>



      <Text style={styles.title}>
        Enter your PIN
      </Text>




      <TextInput

        style={styles.input}

        value={pin}

        onChangeText={(text)=>{

          setPin(text);


          if(text.length === 4){

            Keyboard.dismiss();

          }

        }}

        keyboardType="number-pad"

        maxLength={4}

        secureTextEntry

        placeholder="****"

        placeholderTextColor={colors.textSecondary}

        autoFocus

      />





      <TouchableOpacity

        style={styles.button}

        onPress={handleUnlock}

      >


        <Text style={styles.buttonText}>
          Unlock
        </Text>


      </TouchableOpacity>
      <TouchableOpacity
  style={styles.forgotButton}
  onPress={handleForgotPin}
>

<Text style={styles.forgotText}>
  Forgot PIN?
</Text>

</TouchableOpacity>




</KeyboardAvoidingView>


</TouchableWithoutFeedback>


  );

}






const createStyles = (colors) => StyleSheet.create({


container:{

  flex:1,

  backgroundColor:colors.background,

  justifyContent:'center',

  alignItems:'center',

  padding:SIZES.padding

},





logo:{

  color:colors.primary,

  fontSize:36,

  fontWeight:'bold',

  marginBottom:20

},





title:{

  color:colors.textMain,

  fontSize:22,

  marginBottom:30

},





input:{


  width:200,

  backgroundColor:colors.surface,

  borderWidth:1,

  borderColor:colors.border,

  borderRadius:SIZES.radius,

  color:colors.textMain,

  fontSize:25,

  letterSpacing:15,

  textAlign:'center',

  padding:15,

  marginBottom:35


},






button:{


  backgroundColor:colors.primary,

  paddingVertical:15,

  paddingHorizontal:70,

  borderRadius:SIZES.radius,

  marginTop:10


},






buttonText:{


  color:'#fff',

  fontSize:16,

  fontWeight:'600'


}, forgotButton:{
  marginTop:20
},


forgotText:{
  color:colors.primary,
  fontSize:14,
  fontWeight:'600'
}




});