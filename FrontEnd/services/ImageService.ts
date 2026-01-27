import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';


const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME || '';

const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET || ''; 

const CLOUDINARY_URL = process.envEXPO_PUBLIC_CLOUDINARY_URL || '';



export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need access to your gallery to upload photos.');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 5], 
    quality: 0.7,   
    base64: true,   
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};


export const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
  const data = new FormData();
  
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename as string);
  const type = match ? `image/${match[1]}` : `image`;

  // @ts-ignore
  data.append('file', { uri: imageUri, name: filename, type });
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('cloud_name', CLOUD_NAME);

  try {
    const res = await fetch(CLOUDINARY_URL, {
      method: 'post',
      body: data
    });
    const json = await res.json();
    
    if (json.secure_url) {
      return json.secure_url;
    } else {
      console.error("Cloudinary Error:", json);
      return null;
    }
  } catch (error) {
    console.error("Upload Failed:", error);
    return null;
  }
};

export const uploadStoryImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    const data = new FormData();
    
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename as string);
    const type = match ? `image/${match[1]}` : `image`;
  
    // @ts-ignore
    data.append('file', { uri: imageUri, name: filename, type });
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', CLOUD_NAME);
  
    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'post',
        body: data
      });
      const json = await res.json();
      
      if (json.secure_url) {
        
        const originalUrl = json.secure_url;
        const splitUrl = originalUrl.split('/upload/');
        
        
        const storyUrl = `${splitUrl[0]}/upload/c_pad,ar_9:16,b_blurred:400/${splitUrl[1]}`;
        
        return storyUrl;
      } else {
        console.error("Cloudinary Error:", json);
        return null;
      }
    } catch (error) {
      console.error("Story Upload Failed:", error);
      return null;
    }
  };