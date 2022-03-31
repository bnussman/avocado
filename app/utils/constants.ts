import { Platform } from "react-native";

export const MAX_PAGE_SIZE = 15;

export const isMobile: boolean =
  Platform.OS == "ios" || Platform.OS == "android";

export const isAndroid: boolean = Platform.OS == "android";

export const isIOS: boolean = Platform.OS == "ios";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

export const colors = {
  primary: {
    100: "#FCE8F8",
    200: "#FAD1F6",
    300: "#F1B6F0",
    400: "#E19EE4",
    500: "#C87DD3",
    600: "#A25BB5",
    700: "#7E3E97",
    800: "#5C277A",
    900: "#421765",
  },
};
