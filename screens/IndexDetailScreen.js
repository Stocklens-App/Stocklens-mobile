import React from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppContext';


const INDEX_DESCRIPTIONS = {

  GSE:
    'The Ghana Stock Exchange Composite Index tracks the performance of all listed companies on the Ghana Stock Exchange (GSE), the primary stock exchange in Ghana.',

  SPX:
    'The S&P 500 is a stock market index tracking the performance of 500 of the largest companies listed on stock exchanges in the United States.',

  NDX:
    'The NASDAQ Composite Index includes almost all stocks listed on the NASDAQ stock exchange, heavily weighted towards technology companies.',

  UKX:
    'The FTSE 100 Index is a share index of the 100 companies listed on the London Stock Exchange with the highest market capitalisation.',

};



const LargeSparkline = ({ data, color }) => {


  if (!data || data.length === 0) return null;


  const width = 320;
  const height = 100;


  const max = Math.max(...data);
  const min = Math.min(...data);


  const range = max - min || 1;


  const stepX = width / (data.length - 1);



  const points = data
    .map((val, i) => {


      const x = i * stepX;


      const y =
        height -
        ((val - min) / range) *
        (height - 8) -
        4;



      return `${x},${y}`;


    })
    .join(' ');



  return (

    <Svg width={width} height={height}>

      <Polyline

        points={points}

        fill="none"

        stroke={color}

        strokeWidth="2.5"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </Svg>

  );


};




export default function IndexDetailScreen({ route, navigation }) {


  const { colors } = useTheme();


  const styles = createStyles(colors);



  const { index } = route.params;



  const { trendingStocks } = useAppData();



  const color = index.positive
    ? colors.success
    : colors.error;



  const description =
    INDEX_DESCRIPTIONS[index.symbol] ||
    'No description available.';



  const topStocks =
    index.symbol === 'GSE'
      ? trendingStocks.slice(0,5)
      : [];



  return (

<View style={styles.root}>


<StatusBar
  barStyle="light-content"
  backgroundColor={colors.background}
/>


{/* HEADER */}

<View style={styles.header}>


<TouchableOpacity

onPress={() => navigation.goBack()}

style={styles.backBtn}

>


<Ionicons

name="chevron-back"

size={24}

color={colors.textMain}

/>


</TouchableOpacity>



<Text style={styles.headerTitle}>

{index.name}

</Text>



<View style={{width:36}} />



</View>





<ScrollView

showsVerticalScrollIndicator={false}

contentContainerStyle={styles.scrollContent}

>



{/* PRICE CARD */}

<View style={styles.priceCard}>


<View style={styles.priceRow}>


<Text style={styles.flag}>

{index.flag}

</Text>



<View>


<Text style={styles.symbol}>

{index.symbol}

</Text>



<Text style={styles.indexName}>

{index.name}

</Text>



</View>


</View>





<Text style={styles.price}>

{index.price.toLocaleString()}

</Text>




<View style={styles.changeRow}>


<View

style={[
styles.changeBadge,
{
backgroundColor:
color + '22'
}
]}

>


<Ionicons

name={
index.positive
?
'arrow-up'
:
'arrow-down'
}

size={14}

color={color}

/>



<Text

style={[
styles.changeText,
{
color
}
]}

>


{index.changeValue}
({' '}
{index.changePercent}
%)


</Text>



</View>




<Text style={styles.todayLabel}>

Today

</Text>



</View>



</View>







{/* PERFORMANCE CARD */}


<View style={styles.card}>


<Text style={styles.cardTitle}>

Performance

</Text>



<View style={styles.chartWrapper}>


<LargeSparkline

data={index.sparklineData}

color={color}

/>


</View>




<View style={styles.chartLabels}>


<Text style={styles.chartLabel}>

7 days ago

</Text>



<Text style={styles.chartLabel}>

Today

</Text>



</View>



</View>







{/* ABOUT CARD */}


<View style={styles.card}>


<Text style={styles.cardTitle}>

About

</Text>




<Text style={styles.description}>

{description}

</Text>



</View>







{/* TOP STOCKS */}



{
topStocks.length > 0 && (

<View style={styles.card}>


<Text style={styles.cardTitle}>

Top Constituents

</Text>



{
topStocks.map((stock,idx)=>{


const stockColor =
stock.positive
?
colors.success
:
colors.error;



return (

<View

key={stock.ticker}

style={[
styles.stockRow,
idx < topStocks.length -1 &&
styles.stockRowBorder
]}


>



<View

style={[
styles.stockLogo,
{
backgroundColor:
stock.logoColor
}
]}

>


<Text style={styles.stockInitials}>

{stock.initials}

</Text>


</View>





<View style={styles.stockInfo}>


<Text style={styles.stockName}>

{stock.companyName}

</Text>



<Text style={styles.stockTicker}>

{stock.ticker} • GSE

</Text>



</View>






<View style={styles.stockPriceCol}>


<Text style={styles.stockPrice}>

GHS {stock.currentPrice.toFixed(2)}

</Text>



<Text

style={[
styles.stockChange,
{
color:stockColor
}
]}

>


{
stock.positive
?
'+'
:
''
}

{stock.priceChangePercent}%



</Text>



</View>




</View>


);



})


}



</View>


)


}



</ScrollView>


</View>


);


}
const createStyles = (colors) => StyleSheet.create({

root:{
  flex:1,
  backgroundColor:colors.background
},


scrollContent:{
  padding:SIZES.padding,
  paddingBottom:40
},


header:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-between',
  paddingHorizontal:SIZES.padding,
  paddingTop:54,
  paddingBottom:16,
  backgroundColor:colors.background
},


backBtn:{
  width:36,
  height:36,
  borderRadius:18,
  backgroundColor:colors.surface,
  borderWidth:1,
  borderColor:colors.border,
  alignItems:'center',
  justifyContent:'center'
},


headerTitle:{
  fontSize:16,
  fontWeight:'700',
  color:colors.textMain
},



priceCard:{
  backgroundColor:colors.surface,
  borderRadius:16,
  borderWidth:1,
  borderColor:colors.border,
  padding:20,
  marginBottom:16
},


priceRow:{
  flexDirection:'row',
  alignItems:'center',
  gap:12,
  marginBottom:16
},


flag:{
  fontSize:32
},


symbol:{
  fontSize:18,
  fontWeight:'700',
  color:colors.textMain
},


indexName:{
  fontSize:12,
  color:colors.textSecondary,
  marginTop:2
},


price:{
  fontSize:36,
  fontWeight:'bold',
  color:colors.textMain,
  marginBottom:12
},



changeRow:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-between'
},


changeBadge:{
  flexDirection:'row',
  alignItems:'center',
  gap:4,
  paddingHorizontal:10,
  paddingVertical:4,
  borderRadius:20
},


changeText:{
  fontSize:14,
  fontWeight:'600'
},


todayLabel:{
  fontSize:12,
  color:colors.textSecondary
},





card:{
  backgroundColor:colors.surface,
  borderRadius:16,
  borderWidth:1,
  borderColor:colors.border,
  padding:16,
  marginBottom:16
},


cardTitle:{
  fontSize:15,
  fontWeight:'700',
  color:colors.textMain,
  marginBottom:14
},



chartWrapper:{
  alignItems:'center',
  marginBottom:8
},


chartLabels:{
  flexDirection:'row',
  justifyContent:'space-between'
},


chartLabel:{
  fontSize:11,
  color:colors.textSecondary
},



description:{
  fontSize:13,
  color:colors.textSecondary,
  lineHeight:20
},





stockRow:{
  flexDirection:'row',
  alignItems:'center',
  paddingVertical:12,
  gap:12
},


stockRowBorder:{
  borderBottomWidth:1,
  borderBottomColor:colors.border
},



stockLogo:{
  width:40,
  height:40,
  borderRadius:10,
  alignItems:'center',
  justifyContent:'center'
},


stockInitials:{
  color:'#fff',
  fontSize:11,
  fontWeight:'700'
},


stockInfo:{
  flex:1
},


stockName:{
  fontSize:13,
  fontWeight:'600',
  color:colors.textMain,
  marginBottom:2
},


stockTicker:{
  fontSize:11,
  color:colors.textSecondary
},


stockPriceCol:{
  alignItems:'flex-end'
},


stockPrice:{
  fontSize:13,
  fontWeight:'700',
  color:colors.textMain,
  marginBottom:2
},


stockChange:{
  fontSize:11,
  fontWeight:'600'
},


});