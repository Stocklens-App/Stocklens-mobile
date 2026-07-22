import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Switch
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../theme';



export default function NotificationScreen(){

  const { colors } = useTheme();


  const [priceAlerts, setPriceAlerts] = useState(true);
  const [marketNews, setMarketNews] = useState(true);
  const [portfolioUpdates, setPortfolioUpdates] = useState(true);



  useEffect(()=>{

    loadSettings();

  },[]);



  const loadSettings = async()=>{

    const price =
    await AsyncStorage.getItem('priceAlerts');

    const news =
    await AsyncStorage.getItem('marketNews');

    const portfolio =
    await AsyncStorage.getItem('portfolioUpdates');


    if(price !== null)
      setPriceAlerts(price === 'true');


    if(news !== null)
      setMarketNews(news === 'true');


    if(portfolio !== null)
      setPortfolioUpdates(portfolio === 'true');

  };



  const saveSetting = async(key,value)=>{

    await AsyncStorage.setItem(
      key,
      value.toString()
    );

  };



return(

<View style={styles(colors).container}>


<Text style={styles(colors).title}>
Notifications
</Text>



<View style={styles(colors).card}>


<View style={styles(colors).row}>

<Text style={styles(colors).text}>
Price Alerts
</Text>


<Switch

value={priceAlerts}

onValueChange={(value)=>{

setPriceAlerts(value);

saveSetting(
'priceAlerts',
value
);

}}

/>


</View>



<View style={styles(colors).row}>

<Text style={styles(colors).text}>
Market News
</Text>


<Switch

value={marketNews}

onValueChange={(value)=>{

setMarketNews(value);

saveSetting(
'marketNews',
value
);

}}

/>


</View>




<View style={styles(colors).row}>

<Text style={styles(colors).text}>
Portfolio Updates
</Text>


<Switch

value={portfolioUpdates}

onValueChange={(value)=>{

setPortfolioUpdates(value);

saveSetting(
'portfolioUpdates',
value
);

}}

/>


</View>



</View>


</View>

);


}



const styles=(colors)=>StyleSheet.create({

container:{
flex:1,
backgroundColor:colors.background,
padding:SIZES.padding,
paddingTop:60
},


title:{
fontSize:28,
fontWeight:'bold',
color:colors.textMain,
marginBottom:25
},


card:{
backgroundColor:colors.surface,
borderRadius:16,
padding:15
},


row:{
flexDirection:'row',
alignItems:'center',
justifyContent:'space-between',
paddingVertical:18
},


text:{
color:colors.textMain,
fontSize:16
}


});