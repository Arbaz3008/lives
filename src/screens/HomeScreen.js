import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ListItems from './ListItemScreen'
import { LinearGradient } from 'expo-linear-gradient'

export default function HomeScreen(){
  return (
    
    <View style={styles.container} >
      <LinearGradient colors={['#edf7fc', '#d8eff8']} style={styles.background}>
     <ListItems/>
     </LinearGradient>
    </View>
    
  )
}


const styles = StyleSheet.create({
container:{
    flex:1,
    justifyContent:"center",
},
background: {
  flex: 1,
},
})