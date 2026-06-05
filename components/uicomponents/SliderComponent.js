import { FlatList, View, Text, Dimensions, Image, TouchableOpacity } from 'react-native';
import { serverURL } from '../../services/FetchNodeServices';
var { width, height } = Dimensions.get('window');

export default function SliderComponent({ data, onCategorySelect, selectedCategoryId }) {
  const CategoryView = ({ item }) => {
    const isSelected = selectedCategoryId === item.categoryid;
    return (
      <TouchableOpacity 
        onPress={() => onCategorySelect && onCategorySelect(item)}
        style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 }}
      >
        <View
          style={{
            marginTop: 12,
            alignItems: 'center',
            justifyContent: 'center',
            height: height * 0.1,
            width: height * 0.1,
            borderRadius: (height * 0.1) / 2,
            borderWidth: 2,
            borderColor: isSelected ? '#12daa8' : '#2f3542',
            backgroundColor: '#1e1e1e',
            overflow: 'hidden',
          }}
        >
          <Image
            style={{
              width: '80%',
              height: '80%',
              resizeMode: 'contain',
            }}
            source={{ uri: `${serverURL}/images/${item.image}` }}
          />
        </View>
        <Text style={{ color: isSelected ? '#12daa8' : '#fff', marginTop: 5, fontSize: 11, fontWeight: isSelected ? 'bold' : 'normal' }}>
          {item.categoryname}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <CategoryView item={item} />
        )}
        keyExtractor={item => item.categoryid.toString()}
      />
    </View>
  );
}
