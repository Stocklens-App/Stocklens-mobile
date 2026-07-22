import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DarkColors, LightColors } from '../theme';


const ThemeContext = createContext();


export function ThemeProvider({ children }) {


  const [darkMode, setDarkMode] = useState(false);

  const [themeLoaded, setThemeLoaded] = useState(false);



  useEffect(() => {

    loadTheme();

  }, []);




  const loadTheme = async () => {

    try {

      const savedTheme = await AsyncStorage.getItem('darkMode');


      if(savedTheme !== null){

        setDarkMode(savedTheme === 'true');

      }


    } catch(error){

      console.log("Theme loading error:", error);

    }
    finally{

      setThemeLoaded(true);

    }

  };




  const toggleTheme = async () => {


    const newValue = !darkMode;


    setDarkMode(newValue);


    await AsyncStorage.setItem(
      'darkMode',
      String(newValue)
    );


  };



  if(!themeLoaded){

    return null;

  }


console.log("CURRENT THEME:", darkMode);

  const colors = darkMode
    ? DarkColors
    : LightColors;



  return (

    <ThemeContext.Provider

      value={{
        colors,
        darkMode,
        toggleTheme
      }}

    >

      {children}

    </ThemeContext.Provider>

  );


}



export const useTheme = () => useContext(ThemeContext);