import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import { useMenuViewModel } from '../viewModels/useMenuViewModel';

const HomeScreen = () => {
  const { menuData, loading, error, refresh } = useMenuViewModel();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
        <Button title="Retry" onPress={refresh} />
      </View>
    );
  }

  if (!menuData) {
    return (
      <View style={styles.container}>
        <Text>No data available</Text>
      </View>
    );
  }

  const { drink_of_the_day: drinkOfTheDay } = menuData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drink of the Day</Text>
      <Image 
        source={{ uri: drinkOfTheDay.image }} 
        style={styles.image} 
      />
      <Text style={styles.name}>{drinkOfTheDay.name}</Text>
      <Text>{drinkOfTheDay.description}</Text>
      <Text>Taste: {drinkOfTheDay.taste}</Text>
      <Text>Price: 
        {drinkOfTheDay.price.small && ` Small: $${drinkOfTheDay.price.small}`}
        {drinkOfTheDay.price.large && ` Large: $${drinkOfTheDay.price.large}`}
        {drinkOfTheDay.price.regular && ` Regular: $${drinkOfTheDay.price.regular}`}
      </Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});

export default HomeScreen;