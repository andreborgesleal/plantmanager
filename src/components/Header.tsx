import React, { useEffect, useState } from 'react';
import 
{
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import userImg from '../assets/6584529.jpg';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import AsyncStarage from '@react-native-async-storage/async-storage';

export function Header(){
  const [userName, setUserName] = useState<string>();
  useEffect(() => {
      async function loadStorageUserName()
      {
          const user = await AsyncStarage.getItem('@plantmanager:user');
          setUserName(user || '');
      }

      loadStorageUserName();      
  },[userName]);  // when userName changes, useEffect is calling again.
                  // if array is Empty like "[]", useEffect is colling once
                  // before loading page
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Olá,</Text>
        <Text style={styles.userName}>{ userName },</Text>
      </View>
      <Image 
        style={styles.image}
        source={userImg} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: getStatusBarHeight(),
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35
  },
  greeting: {
    fontSize: 32,
    fontFamily: fonts.text,
    color: colors.heading
  },
  userName: {
    fontSize: 32,
    fontFamily: fonts.heading,
    color: colors.heading,
    lineHeight: 40
  }
})

