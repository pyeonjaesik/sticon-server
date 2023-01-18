import {Platform,StatusBar,PermissionsAndroid} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import NetInfo from "@react-native-community/netinfo";

export const URL= 'http://www.sticon.site';

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight() : StatusBar.currentHeight ;
var RNFS = require('react-native-fs');

const androidKeys = {
    kConsumerKey: "2_6oPtc3gZednVh3YV9t",
    kConsumerSecret: "rzGcJGmKQF",
    kServiceAppName: "테스트앱(안드로이드)"
};
const iosKeys = {
    kConsumerKey: "2_6oPtc3gZednVh3YV9t",
    kConsumerSecret: "rzGcJG  mKQF",
    kServiceAppName: "테스트앱(iOS)",
    kServiceAppUrlScheme: "kakaobdb53966dea6023fb2cd6816adf9e61d" // only for iOS
};
export const initials = Platform.OS === "ios" ? iosKeys : androidKeys;

export async function requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return 0;
      } else {
        return 1;
      }
    } catch (err) {
      return 2;
    }
}
export async function _isConnected(){
  var connected=true;
  await NetInfo.fetch().then(state => {
    connected=state.isConnected;
  });
  return connected
}
export async function _checkCache(url){
  var existsIndex=false
  await RNFS.exists(url).then(async exists =>{
    if(exists){
      existsIndex=true;
    }else{
      existsIndex=false;
    }
  });
  return existsIndex;
}
export function _timefunc(updatetime){
  var d1 = new Date(parseInt(Date.now()));
  var d1y=d1.getFullYear();
  var d1m=d1.getMonth()+1;
  var d1d=d1.getDate();
  var d1time=`${d1y}${d1m}${d1d}`;
  var d2 = new Date(updatetime);
  var d2y=d2.getFullYear();
  var d2m=d2.getMonth()+1;
  var d2d=d2.getDate();
  var d2time=`${d2y}${d2m}${d2d}`;
  if(d1time==d2time){
    var time=parseInt(Date.now())-updatetime;
    var h=d2.getHours();
    var m=d2.getMinutes();
    if(m<10){
      m='0'+m;  
    }    
    if(h>=13){
      h=' 오후 '+(h-12)+':'+m;  
    }else if(h>0){
      h=' 오전 '+h+':'+m;  
    }else{
      h=' 오후 '+'12'+':'+m;  
    }
    time=h;
  }else{
    var time=`${d2m}월 ${d2d}일`;
  }
  return time;
}
export const options = {
  title: 'Select Avatar',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'videos',
    // mediaType:'video'

  },
  durationLimit:60,
  videoQuality:'high',
  mediaType:'video'
};
