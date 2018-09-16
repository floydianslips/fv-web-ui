import * as Colors from '@material-ui/core/colors';
import * as ColorManipulator from '@material-ui/core/styles/colorManipulator';
import Spacing from '@material-ui/core/styles/spacing';
import zIndex from '@material-ui/core/styles/zIndex';

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
    disabledColor: ColorManipulator.fade('#000000', 0.3),
    pickerHeaderColor: Colors.teal400
  },
  wrapper: {
    backgroundColor: Colors.white
  }
};