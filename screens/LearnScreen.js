// screens/LearnScreen.js

import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import api from '../context/axios';

import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../theme';



export default function LearnScreen() {


  const { colors } = useTheme();

  const styles = createStyles(colors);



  const [activeCategory, setActiveCategory] = useState('Getting Started');

  const [expandedId, setExpandedId] = useState(null);



  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);





  useEffect(() => {


    const fetchModules = async () => {


      try {


        const response = await api.get(
          '/api/academic/all'
        );


        setModules(response.data);


      } catch(error){


        console.error(
          "Error connecting to backend:",
          error
        );


      } finally {


        setLoading(false);


      }


    };



    fetchModules();


  }, []);






  const categories = [
    'Getting Started',
    'Glossary',
    'GSE Basics',
    'Scams'
  ];





  const filteredData = modules.filter(
    item =>
      item.category === activeCategory
  );






  const toggleExpand = (id)=>{


    setExpandedId(
      expandedId === id
      ? null
      : id
    );


  };







  if(loading){


    return (

      <View style={[
        styles.container,
        {
          justifyContent:'center',
          alignItems:'center'
        }
      ]}>


        <ActivityIndicator
          size="large"
          color={colors.primary}
        />


        <Text style={[
          styles.subtitleText,
          {
            marginTop:15
          }
        ]}>

          Connecting to StockLens network...

        </Text>


      </View>

    );


  }








return (

<View style={styles.container}>


<Text style={styles.headerTitle}>
  Learn
</Text>





<View style={{
  height:40,
  marginBottom:5
}}>


<ScrollView

horizontal

showsHorizontalScrollIndicator={false}

contentContainerStyle={
styles.tabScrollContainer
}

>


{

categories.map((cat)=>(


<TouchableOpacity

key={cat}

onPress={()=>{


setActiveCategory(cat);

setExpandedId(null);


}}

style={styles.tabButton}


>


<Text

style={[
styles.tabText,

activeCategory === cat &&
styles.activeTabText

]}


>

{cat}


</Text>





{

activeCategory === cat &&

<View style={styles.activeIndicatorLine}/>

}



</TouchableOpacity>


))


}



</ScrollView>


</View>







<ScrollView

style={styles.questionsList}

showsVerticalScrollIndicator={false}


>


{


filteredData.map(item=>{


const isExpanded =
expandedId === item.id;



return (


<TouchableOpacity


key={item.id}


activeOpacity={0.9}


onPress={()=>toggleExpand(item.id)}


style={[

styles.card,

isExpanded &&
styles.expandedCard

]}



>


<View style={styles.cardHeader}>


<View

style={[
styles.boxIcon,

isExpanded &&
styles.boxIconActive

]}


/>


<View

style={[
styles.boxInner,

isExpanded &&
styles.boxInnerActive

]}


/>





<Text style={styles.questionText}>


{item.question}


</Text>





<Text style={styles.chevronIcon}>


{

isExpanded
?
'▲'
:
'▼'

}


</Text>




</View>





{


isExpanded &&


<View style={styles.answerContainer}>


<Text style={styles.answerText}>


{item.answer}


</Text>



</View>



}



</TouchableOpacity>



);


})



}



</ScrollView>



</View>


);


}
const createStyles = (colors) => StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: colors.background,

    paddingTop: 60,

    paddingHorizontal: SIZES.padding,

  },



  headerTitle: {

    color: colors.textMain,

    fontSize: 22,

    fontWeight: 'bold',

    textAlign: 'center',

    marginBottom: 25,

  },



  tabScrollContainer: {

    alignItems:'center',

  },



  tabButton: {

    marginRight:24,

    position:'relative',

    paddingBottom:6,

  },



  tabText: {

    color: colors.textSecondary,

    fontWeight:'600',

    fontSize:15,

  },



  activeTabText: {

    color: colors.textMain,

  },



  activeIndicatorLine: {

    position:'absolute',

    bottom:0,

    left:0,

    right:0,

    height:2,

    backgroundColor:colors.primary,

  },





  subtitleText: {

    color:colors.textSecondary,

    fontSize:14,

    textAlign:'center',

  },





  questionsList: {

    flex:1,

    marginTop:10,

  },





  card: {


    backgroundColor:colors.surface,


    padding:18,


    borderRadius:14,


    marginBottom:14,


    borderWidth:1,


    borderColor:colors.border,



  },





  expandedCard:{


    borderColor:colors.primary,


    borderWidth:1.5,


  },






  cardHeader:{


    flexDirection:'row',


    alignItems:'center',


    justifyContent:'space-between',



  },







  boxIcon:{


    width:20,


    height:20,


    borderWidth:1.5,


    borderColor:colors.primary,


    borderRadius:4,


    alignItems:'center',


    justifyContent:'center',


    marginRight:14,



  },







  boxIconActive:{


    backgroundColor:colors.primary + '22',



  },







  boxInner:{


    width:8,


    height:8,


    borderRadius:1,



  },







  boxInnerActive:{


    backgroundColor:colors.primary,



  },







  questionText:{


    color:colors.textMain,


    fontSize:14,


    fontWeight:'600',


    flex:1,


    lineHeight:20,



  },








  chevronIcon:{


    color:colors.textSecondary,


    fontSize:10,


    marginLeft:10,



  },








  answerContainer:{


    marginTop:18,


    borderTopWidth:1,


    borderColor:colors.border,


    paddingTop:16,



  },








  answerText:{


    color:colors.textSecondary,


    fontSize:13,


    lineHeight:22,


    marginBottom:16,



  },



});