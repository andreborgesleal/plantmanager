import React, { useEffect, useState } from 'react';
import 
{
  View,
  Text,
  StyleSheet,
  FlatList, // renderiza uma lista na tela
  ActivityIndicator // loading
} from 'react-native';
import { color } from 'react-native-reanimated';
import { EnviromentButton } from '../components/EnviromentButton';
import {Header} from '../components/Header';
import { PlantCardPrimary } from '../components/PlantCardPrimary';
import api from '../services/api';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { Load } from '../components/Load';
import { useNavigation } from '@react-navigation/core';
import { PlantProps } from '../libs/storage';

// interface that will receive the api structure
// "plants_environments": [
//   {"key": "living_room", "title": "Sala"},
//   {"key": "bedroom", "title": "Quarto"},
//   {"key": "kitchen", "title": "Cozinha"},
//   {"key": "bathroom", "title": "Banheiro"}
// ],
interface EnviromentProps {
  key: string;
  title: string;
};

export function PlantSelect() {
  const [enviroments, setEnviroments] = useState<EnviromentProps[]>([]);
  const [plants, setPlants] = useState<PlantProps[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PlantProps[]>([]);
  const [enviromentSelected, setEnviromentSelected] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation();

  function handleEnviromentSelected(enviroment: string) {
    setEnviromentSelected(enviroment)
    if (enviroment === 'all')
        return setFilteredPlants(plants);
    
    const filtered = plants.filter(plant => 
      plant.environments.includes(enviroment) // include => verifica se enviroments
                                              // contém environment
    )

    setFilteredPlants(filtered);
  }

  async function fetchPlants(){
    const { data } = await api
    .get(`plants?_sort=name&_order=asc&_page=${page}&_limit=8`);

    if (!data)      
        return setLoading(true);

    if (page > 1)
    {
        // Appends Plants with data retrieved from API
        // oldValue = prior data values before loads the new page
        // It's crazy ! crazy ! crazy 
        setPlants(oldValue => [...oldValue, ...data])
        setFilteredPlants(oldValue => [...oldValue, ...data])          
    }          
    else
    {
      setPlants(data);
      setFilteredPlants(data)
    }

    setLoading(false);
    setLoadingMore(false);
  }

  function handleFetchMore(distance: number) {
    if (distance < 1) // useful screen area
        return
    // the steps below occurs when the user taps and drags the screen to view more data
    setLoadingMore(true);
    setPage(oldValue => oldValue + 1);
    fetchPlants();
  }

  function handlePlantSelect(plant: PlantProps){
    navigation.navigate('PlantSave', { plant });
  }

  // useEffect is executed before the screen is displayed
  // consumes the api 
  useEffect(() => {
    async function fetchEnviroment(){
      const { data } = await api
      .get('plants_environments?_sort=title&_order=asc');
      setEnviroments([
        {
          key: 'all',
          title: 'todos',          
        },
        ...data
      ]);
    }

    fetchEnviroment();

  },[])

  useEffect(() => {
    fetchPlants();
  },[])
  
  if(loading)
    return <Load />

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <Header />
        <Text style={styles.title}>
          Em qual ambiente
        </Text>
        <Text style={styles.subtitle}> 
          Você quer colocar sua planta?
        </Text>
      </View>
      <View>
        <FlatList 
          data={enviroments}
          keyExtractor={(item) => String(item.key)}
          renderItem={({item}) => (
            <EnviromentButton 
                title={item.title}
                active={item.key === enviromentSelected}
                onPress={() => handleEnviromentSelected(item.key)}
            />
          )} 
          horizontal    
          showsHorizontalScrollIndicator={false}  
          contentContainerStyle={styles.enviromentList} 
        />
      </View>

      <View style={styles.plants}>
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlantCardPrimary 
              data={item} 
              onPress={() => handlePlantSelect(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          onEndReachedThreshold={0.1} // occurs when the user taps and drags 
                                      // the screen until 10% from the bottom 
                                      // limited 
                                      // remember:  0 is the top off the screen
                                      //            1 is the bottom off the screen
          onEndReached={
            ({ distanceFromEnd }) => handleFetchMore(distanceFromEnd)
          }
          ListFooterComponent={
            loadingMore
            ? <ActivityIndicator color={colors.green} />
            : <></>
          }
        />


      </View>      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 30
  },
  title: {
    fontSize: 17,
    color: colors.heading,
    fontFamily: fonts.heading,
    lineHeight: 20,
    marginTop: 15
  },
  subtitle: {
    fontFamily: fonts.text,
    fontSize: 17,
    lineHeight: 20,
    color: colors.heading
  },
  enviromentList: {
    height: 40,
    justifyContent: 'center',
    paddingBottom: 5,
    marginLeft: 32,
    marginVertical: 32
  },
  plants: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center'
  },
})