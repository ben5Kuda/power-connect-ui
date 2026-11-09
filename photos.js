import * as ImagePicker from 'expo-image-picker';

// Let the user choose a photo (or take one with the camera) and return it as base64 text:
// "data:image/jpeg;base64,/9j/4AAQ..."  - or null if they cancelled.
// That text is what we send to the API and store in the database.
export async function pickPhoto(useCamera) {
  const options = {
    mediaTypes: ['images'],
    quality: 0.3,          // smaller file: 0 = lowest quality, 1 = best
    base64: true,          // give us the picture as base64 text
  };

  let result;
  if (useCamera) {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;
    result = await ImagePicker.launchCameraAsync(options);
  } else {
    result = await ImagePicker.launchImageLibraryAsync(options);
  }

  if (result.canceled) return null;
  const photo = result.assets[0];

  // On a phone we get the base64 text; in the web browser the uri is already a "data:" text
  if (photo.base64) {
    return 'data:' + (photo.mimeType || 'image/jpeg') + ';base64,' + photo.base64;
  }
  return photo.uri;
}
