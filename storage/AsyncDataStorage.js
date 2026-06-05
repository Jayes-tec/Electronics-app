// import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from "@react-native-async-storage/async-storage";


export async function checkSyncData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('Keeeeeeeeeeys:', keys.length);
    if (keys.length == 0) return false;
    else return keys;
  } catch (e) {
    console.log('Error:Key Errors');
    return false;
  }
}


export async function getSyncData(key) {
  try {
    const value = await AsyncStorage.getItem(`${key}`);
    console.log('Async Data:', value);
    if (value !== null) {
      var userData = JSON.parse(value);
      console.log('Async Data :', value);
      return userData;
    } else {
      console.log('No Data Found..');
      return null;
    }
  } catch (e) {
    console.log('Async Data Error', e);
    return null;
  }
}

export async function storeDatasync(key, body) {
  try {
    await AsyncStorage.setItem(`${key}`, JSON.stringify(body));
  } catch (e) {
    console.log('Error in saving data', e);
  }
}

export async function removeDatasync(key) {
  try {
    const data = await AsyncStorage.removeItem(`${key}`);
    console.log({data});
  } catch (e) {
    console.log('Error in saving data');
  }
}
