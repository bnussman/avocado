export default {
  name: "Avocado",
  version: '1.0.0',
  owner: "bnussman",
  primaryColor: "#C87DD3",
  icon: "./assets/icon.png",
  platforms: ["ios", "android", "web"],
  notification: {
    iosDisplayInForeground: true,
  },
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#ffffff",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "community.avocado.app",
    buildNumber: "1",
  },
  android: {
    package: "community.avocado.app",
    versionCode: 1,
    // googleServicesFile: "./google-services.json",
    useNextNotificationsApi: true,
    permissions: [ "VIBRATE" ],
  },
};