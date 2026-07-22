import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';

import { SIZES } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAppData } from '../context/AppContext';


// Maps home tab's trending stock shape to what StockDetail expects
const toStockDetailFormat = (trending) => ({
  id: null,
  symbol: trending.ticker,
  name: trending.companyName,
  currentPrice: trending.currentPrice,
  priceChangePercentage: trending.priceChangePercent,
  logoColor: trending.logoColor,
  sector: trending.sector,
  history: trending.sparklineData,
  verifiedBrokers: [],
});



const Sparkline = ({ data, color, width = 60, height = 30 }) => {

  if (!data || data.length === 0) return null;


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
        (height - 4) -
        2;


      return `${x},${y}`;

    })
    .join(' ');



  return (

    <Svg width={width} height={height}>

      <Polyline

        points={points}

        fill="none"

        stroke={color}

        strokeWidth="2"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </Svg>

  );

};




export default function DashboardScreen({ route, navigation }) {


  const { colors } = useTheme();

  const styles = createStyles(colors);



  const rawName =
    route?.params?.userName || 'User';


  const displayName =
    rawName.length > 12
      ? `${rawName.slice(0,12)}...`
      : rawName;



  const {
    marketIndices,
    trendingStocks,
    scamAlerts,
    loading,
    error

  } = useAppData();



  const [searchVisible, setSearchVisible] =
    useState(false);



  const [searchText, setSearchText] =
    useState('');



  const [filteredStocks, setFilteredStocks] =
    useState([]);




  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

      </View>

    );

  }




  if (error) {

    return (

      <View style={styles.loadingContainer}>


        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color={colors.textSecondary}
        />


        <Text style={styles.errorText}>
          {error}
        </Text>


      </View>

    );

  }





  const handleSearch = (text) => {

    setSearchText(text);



    if(text.trim() === ''){

      setFilteredStocks([]);

      return;

    }



    const results =
      trendingStocks.filter(stock =>

        stock.companyName
        .toLowerCase()
        .includes(text.toLowerCase())

        ||

        stock.ticker
        .toLowerCase()
        .includes(text.toLowerCase())

      );



    setFilteredStocks(results);

  };
return (

<View style={styles.root}>


<StatusBar
  barStyle="light-content"
  backgroundColor={colors.background}
/>



<ScrollView

style={styles.scroll}

contentContainerStyle={styles.scrollContent}

showsVerticalScrollIndicator={false}

>



{/* HEADER */}

<View style={styles.header}>


<TouchableOpacity

style={styles.profileHeaderRow}

onPress={() => navigation.navigate('Profile')}

activeOpacity={0.6}

>


<Ionicons

name="person-circle"

size={36}

color={colors.primary}

/>



<View style={styles.nameAndChevronRow}>


<Text style={styles.userName}>

{displayName}

</Text>



<Ionicons

name="chevron-forward"

size={16}

color={colors.textSecondary}

/>



</View>



</TouchableOpacity>





<View style={styles.headerIcons}>


<TouchableOpacity

style={styles.iconBtn}

onPress={() => setSearchVisible(true)}

>


<Ionicons

name="search-outline"

size={20}

color={colors.textMain}

/>


</TouchableOpacity>




<TouchableOpacity

style={styles.iconBtn}

onPress={() =>
alert("You have 2 new notifications")
}

>


<Ionicons

name="notifications-outline"

size={20}

color={colors.textMain}

/>



<View style={styles.badge}>

<Text style={styles.badgeText}>
2
</Text>

</View>


</TouchableOpacity>



</View>


</View>







{/* MARKET PULSE */}


<View style={styles.card}>


<View style={styles.cardHeader}>


<View>


<Text style={styles.cardTitle}>
Market Pulse
</Text>



<Text style={styles.cardSubtitle}>
Global markets at a glance
</Text>


</View>



<Text style={styles.todayLabel}>
Today
</Text>


</View>






<ScrollView

horizontal

showsHorizontalScrollIndicator={false}

contentContainerStyle={styles.indicesRow}

>


{marketIndices.map((index)=>{


const color =
index.positive
? colors.success
: colors.error;



return (

<TouchableOpacity

key={index.symbol}

style={styles.indexCard}

onPress={() =>
navigation.navigate(
'IndexDetail',
{index}
)
}


activeOpacity={0.7}

>



<Text style={styles.flagEmoji}>
{index.flag}
</Text>




<Text style={styles.indexName}>
{index.name}
</Text>




<Text style={styles.indexPrice}>
{index.price.toLocaleString()}
</Text>




<Text

style={[
styles.indexChange,
{color}
]}

>

{index.positive ? '↑':'↓'}
{' '}
{index.changeValue}

</Text>




<Text

style={[
styles.indexPercent,
{color}
]}

>

({index.changePercent}%)

</Text>



<Sparkline

data={index.sparklineData}

color={color}

width={86}

height={28}

/>



</TouchableOpacity>


);


})}


</ScrollView>






<Modal

visible={searchVisible}

animationType="slide"

onRequestClose={() =>
setSearchVisible(false)
}

>


<View style={styles.modalContainer}>




<TextInput

placeholder="Search stocks..."

placeholderTextColor={colors.textSecondary}

value={searchText}

onChangeText={handleSearch}

style={styles.searchInput}

/>





<FlatList


data={
searchText.trim()===''
?
trendingStocks
:
filteredStocks
}



keyExtractor={(item)=>
item.ticker
}



renderItem={({item})=>(



<TouchableOpacity


style={styles.searchRow}



onPress={()=>{


setSearchVisible(false);



navigation.navigate(
'StockDetail',
{
stock:
toStockDetailFormat(item)
}
);



}}



>


<View

style={[
styles.stockLogo,
{
backgroundColor:
item.logoColor ||
colors.primary
}
]}

>


<Text style={styles.stockInitials}>

{item.initials ||
item.ticker.substring(0,3)}

</Text>


</View>





<View>


<Text style={styles.stockName}>

{item.companyName}

</Text>



<Text style={styles.stockTicker}>

{item.ticker} • GSE

</Text>


</View>




</TouchableOpacity>



)}

/>





<TouchableOpacity

onPress={() =>
setSearchVisible(false)
}

style={styles.closeButton}


>


<Text style={styles.closeText}>
Close
</Text>


</TouchableOpacity>



</View>


</Modal>



</View>





{/* TRENDING TODAY */}


<View style={styles.sectionHeader}>


<Text style={styles.sectionTitle}>
Trending today
</Text>



<TouchableOpacity

onPress={() =>
navigation.navigate('Invest')
}

>


<Text style={styles.seeAll}>
See all
</Text>


</TouchableOpacity>



</View>






<View style={styles.card}>


{trendingStocks.slice(0,5).map((stock,idx)=>{


const color =
stock.positive
?
colors.success
:
colors.error;




return (


<TouchableOpacity

key={stock.ticker}

style={[
styles.stockRow,
idx < 4 &&
styles.stockRowBorder
]}


onPress={() =>
navigation.navigate(
'StockDetail',
{
stock:
toStockDetailFormat(stock)
}
)
}



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
{color}
]}

>

{stock.positive ? '+' : ''}
{stock.priceChangePercent}%

</Text>



</View>





<Sparkline

data={stock.sparklineData}

color={color}

width={56}

height={28}

/>



</TouchableOpacity>


);


})}


</View>






{/* SCAM ALERTS */}


{scamAlerts.map((alert,idx)=>(


<TouchableOpacity

key={idx}

style={styles.scamAlert}

>


<Ionicons

name="warning-outline"

size={20}

color={colors.error}

/>




<View style={styles.scamText}>


<Text style={styles.scamLabel}>
SCAM ALERT
</Text>


<Text style={styles.scamMessage}>
{alert}
</Text>


</View>



</TouchableOpacity>


))}



</ScrollView>


</View>

);}
const createStyles = (colors) => StyleSheet.create({

root:{
  flex:1,
  backgroundColor:colors.background
},


scroll:{
  flex:1
},


scrollContent:{
  padding:SIZES.padding,
  paddingTop:54,
  paddingBottom:40
},


loadingContainer:{
  flex:1,
  backgroundColor:colors.background,
  alignItems:'center',
  justifyContent:'center',
  gap:12
},


errorText:{
  fontSize:14,
  color:colors.textSecondary,
  textAlign:'center',
  paddingHorizontal:40
},



header:{
  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center',
  marginBottom:24
},


profileHeaderRow:{
  flexDirection:'row',
  alignItems:'center',
  gap:8
},


nameAndChevronRow:{
  flexDirection:'row',
  alignItems:'center',
  gap:4
},


userName:{
  fontSize:20,
  fontWeight:'bold',
  color:colors.textMain
},


headerIcons:{
  flexDirection:'row',
  gap:8
},


iconBtn:{
  position:'relative',
  width:36,
  height:36,
  borderRadius:18,
  backgroundColor:colors.surface,
  borderWidth:1,
  borderColor:colors.border,
  alignItems:'center',
  justifyContent:'center'
},


badge:{
  position:'absolute',
  top:-3,
  right:-3,
  backgroundColor:colors.success,
  borderRadius:8,
  minWidth:16,
  height:16,
  alignItems:'center',
  justifyContent:'center'
},


badgeText:{
  color:'#fff',
  fontSize:9,
  fontWeight:'bold'
},



card:{
  backgroundColor:colors.surface,
  borderRadius:16,
  borderWidth:1,
  borderColor:colors.border,
  padding:16,
  marginBottom:16
},


cardHeader:{
  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'flex-start',
  marginBottom:14
},


cardTitle:{
  fontSize:16,
  fontWeight:'700',
  color:colors.textMain
},


cardSubtitle:{
  fontSize:11,
  color:colors.textSecondary
},


todayLabel:{
  fontSize:12,
  color:colors.textSecondary
},


indicesRow:{
  gap:10
},


indexCard:{
  backgroundColor:colors.background,
  borderRadius:12,
  borderWidth:1,
  borderColor:colors.border,
  padding:12,
  width:110
},


flagEmoji:{
  fontSize:22,
  marginBottom:6
},


indexName:{
  fontSize:10,
  color:colors.textSecondary
},


indexPrice:{
  fontSize:13,
  fontWeight:'700',
  color:colors.textMain
},


indexChange:{
  fontSize:11,
  fontWeight:'600'
},


indexPercent:{
  fontSize:10
},



sectionHeader:{
  flexDirection:'row',
  justifyContent:'space-between',
  alignItems:'center',
  marginBottom:12
},


sectionTitle:{
  fontSize:16,
  fontWeight:'700',
  color:colors.textMain
},


seeAll:{
  fontSize:13,
  color:colors.primary
},



stockRow:{
  flexDirection:'row',
  alignItems:'center',
  paddingVertical:12,
  gap:10
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
  color:colors.textMain
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
  color:colors.textMain
},


stockChange:{
  fontSize:11,
  fontWeight:'600'
},



searchRow:{
  flexDirection:'row',
  alignItems:'center',
  paddingVertical:12,
  borderBottomWidth:1,
  borderBottomColor:colors.border,
  gap:12
},


modalContainer:{
  flex:1,
  backgroundColor:colors.background,
  padding:20
},


searchInput:{
  backgroundColor:colors.surface,
  color:colors.textMain,
  padding:15,
  borderRadius:10,
  marginTop:50,
  marginBottom:20
},


closeButton:{
  marginTop:20,
  alignItems:'center'
},


closeText:{
  color:colors.primary,
  fontWeight:'bold'
},



scamAlert:{
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-between',
  backgroundColor:colors.surface,
  borderRadius:12,
  borderWidth:1.5,
  borderColor:colors.error,
  padding:16,
  marginBottom:12
},


scamText:{
  flex:1
},


scamLabel:{
  fontSize:12,
  fontWeight:'700',
  color:colors.error
},


scamMessage:{
  fontSize:12,
  color:colors.textSecondary
}


});

