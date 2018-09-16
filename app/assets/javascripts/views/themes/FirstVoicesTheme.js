import * as Colors from '@material-ui/core/colors';
import * as ColorManipulator from '@material-ui/core/styles/colorManipulator';
import Spacing from '@material-ui/core/styles/spacing';
import zIndex from '@material-ui/core/styles/zIndex';

export default {
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Arial, sans-serif',
  palette: {
    primary1Color: "#b40000",
    primary2Color: "#3a6880",
    primary3Color: Colors.lightBlack,
    primary4Color: "#c4baa7",
    primary4ColorLightest: "#f0eee9",
    accent1Color: "#b40000",
    accent2Color: "#b40000",
    accent3Color: "#c4baa7",
    accent4Color: "#e1e1e2",
    textColor: "#666666",
    textColorFaded: ColorManipulator.fade("#666666", 0.6),
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade('#000000', 0.3),
    pickerHeaderColor: "#b40000"
  }
};

// Tip: https://cimdalli.github.io/mui-theme-generator/