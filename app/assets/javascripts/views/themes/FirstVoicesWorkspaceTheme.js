import Colors from 'material-ui/styles/colors';
import ColorManipulator from 'material-ui/utils/color-manipulator';
import Spacing from 'material-ui/styles/spacing';
import zIndex from 'material-ui/styles/zIndex';

export default {
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Arial, sans-serif',
  palette: {
    primary1Color: Colors.teal400,
    primary2Color: Colors.teal700,
    primary3Color: Colors.lightBlack,
    accent1Color: Colors.pinkA200,
    accent2Color: "#529c95",
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.teal400
  },
  wrapper: {
    backgroundColor: Colors.white
  }
};