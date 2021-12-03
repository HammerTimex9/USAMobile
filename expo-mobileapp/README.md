# USAMobile App

The mobile version

Prerequisite 
1. Install `Node/NPM`
2. Install `Yarn`
3. Install Xcode, If you have mac
4. On Window Install Android Studio
5. Install Expo Cli

Follow steps to complete setup
https://reactnative.dev/docs/environment-setup

Run following commands to run the project 

`yarn install`

Run IOS
`yarn ios`

Run Android 
`yarn android`

Run Web 
`yarn web`


Envoirment Setup/Versions

`node : v16.13.0`
`npm: 8.1.0`
`yarn: 1.22.17`
`expo: 4.13.0`
`Xcode: 13.1`
`Android Studio: 4.2.2`




EventEmitter Error
Replace in `node_modules/moralis/lib/react-native/EventEmitter.js` file

`var EventEmitter = require('../../../react-native/Libraries/vendor/emitter/EventEmitter');`

replace with

`import EventEmitter from '../../../react-native/Libraries/vendor/emitter/EventEmitter';`

