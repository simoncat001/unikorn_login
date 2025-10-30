import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";

const wordTemplateId = "e6749abb-c487-4b6c-98e0-8637f2bc1933";

const allColor = {
  primaryDark: "#233A50",
  primaryColor: "#2680C2",
  lightFill: "#F0F4F8",
  accentBackground: "#F9F9F9",
  bodyText: "#102A43",
  seoncdaryBodyText: "#627D98",
  border: "#9FB3C8",
  lighterBorder: "#EDEDED",
  background: "#FFFFFF",
  failure: "#D64545",
  success: "#219653",
  warning: "#FC9831",
  highlight: "#EEB442",
  inactive: "#DEDEDE",
  positiveFeedback: "#219653",
  negativeFeedback: "#D64545",
  requiredRed: "#E55D3F",
  backButtonColor: "#1A73C9",
  darkFill: "#E3E3E3",
  standardBlue: "#257FD2",
  lightBodyText: "#BDBDBD",
  primaryGreen: "#14AAB4",
  tagMGID: "#DD9090",
  darkGreyBodyText: "#7A7A7A",
  deepBlue: "#063E8B"
};

const iconSize = {
  small: "14pt",
  regular: "16pt",
  large: "22pt",
};

const fontStyles = makeStyles((theme: Theme) =>
  createStyles({
    boldFont: {
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
      fontFamily: "PingFang SC, sans-serif",
      color: allColor.bodyText,
    },
    unboldFont: {
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "14px",
      fontFamily: "PingFang SC, sans-serif",
      color: allColor.bodyText,
    },
    unboldFontWhite: {
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "14px",
      fontFamily: "PingFang SC, sans-serif",
      color: "white",
    },
    WordCreatetitle: {
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "20px",
      lineHeight: "20px",
      textAlign: "center",
      letterSpacing: "0.05em",
      fontFamily: "PingFang SC, sans-serif",
    },
    NotFoundfonttitle: {
      fontFamily: "STIXIntegralsUp, sans-serif",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "162px",
      letterSpacing: "0.035em",
      color: allColor.background,
    },
    NotFoundfontmessage: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "22px",
      color: allColor.background,
    },
    NotFoundfonttips: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontSize: "14px",
      color: allColor.background,
    },
    Errorfonttitle: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightBold as any,
      fontSize: "59px",
      letterSpacing: "0.005em",
      color: allColor.background,
    },
    Errorfontmessage: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "22px",
      color: allColor.background,
    },
    CardChineseName: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: 600,
      fontSize: "16px",
      color: allColor.bodyText,
    },
    CardEnglishName: {
      fontFamily: "SF Pro Text, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "12px",
      color: allColor.seoncdaryBodyText,
    },
    CardDisplayItem: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
      color: allColor.bodyText,
    },
    CardBasicInfo: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
      color: allColor.seoncdaryBodyText,
    },
    CardMGID: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "14px",
      color: allColor.lightBodyText,
    },
    BarSearchName: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "16px",
      color: allColor.background,
    },
    LastNextStep: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      color: allColor.primaryDark,
    },
    LogoFont: {
      fontFamily: "SF Pro Display, sans-serif",
      fontStyle: "italic",
      fontWeight: 700,
      fontSize: "20px",
    },
    AppbarFont: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      color: allColor.background,
    },
    CheckboxFont: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      color: allColor.bodyText,
    },
    UsernameFont: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: 600,
      fontSize: "14px",
      lineHeight: "20px",
      color: allColor.background,
    },
    DetailTitle: {
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "20px",
      color: allColor.primaryDark,
    },
    DeleteFont: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      color: allColor.primaryColor,
    },
    ButtonFont: {
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "14px",
      fontFamily: "PingFang SC, sans-serif",
      color: allColor.background,
    },
    H4: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: 600,
      fontSize: "20px",
      color: allColor.bodyText,
    },
    H2: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: 600,
      fontSize: "30px",
      color: allColor.primaryDark,
    },
    BodyGrey: {
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
      fontFamily: "PingFang SC, sans-serif",
      color: allColor.darkGreyBodyText,
    },
    TemplateNameFont: {
      fontFamily: "PingFang SC, sans-serif",
      fontStyle: "normal",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      color: allColor.seoncdaryBodyText,
    },
  })
);

const buttonStyles = makeStyles((theme: Theme) =>
  createStyles({
    Primary: {
      backgroundColor: allColor.primaryColor,
      color: allColor.background,
      height: "32px",
      minWidth: "10px",
      padding: "8px 24px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      "&:hover": {
        backgroundColor: allColor.primaryColor,
        color: allColor.background,
      },
    },
    PrimarySmall: {
      backgroundColor: allColor.primaryColor,
      color: allColor.background,
      height: "24px",
      minWidth: "10px",
      padding: "4px 8px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
      "&:hover": {
        backgroundColor: allColor.primaryColor,
        color: allColor.background,
      },
    },
    Secondary: {
      backgroundColor: allColor.lightFill,
      color: allColor.primaryDark,
      height: "32px",
      minWidth: "10px",
      padding: "8px 24px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "16px",
      "&:hover": {
        backgroundColor: allColor.lightFill,
        color: allColor.bodyText,
      },
    },
    SecondarySmall: {
      backgroundColor: allColor.background,
      color: allColor.primaryColor,
      borderStyle: "solid",
      borderWidth: "0.5px",
      borderColor: allColor.border,
      boxSizing: "border-box",
      height: "24px",
      minWidth: "10px",
      padding: "4px 8px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
    },
    SecondaryIcon: {
      backgroundColor: allColor.background,
      color: allColor.seoncdaryBodyText,
      borderStyle: "solid",
      borderWidth: "0.5px",
      borderColor: allColor.border,
      boxSizing: "border-box",
      height: "32px",
      minWidth: "10px",
      padding: "8px 24px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "16px",
    },
    SecondaryIconHover: {
      backgroundColor: allColor.background,
      color: allColor.primaryColor,
      borderStyle: "solid",
      borderWidth: "0.5px",
      borderColor: allColor.primaryColor,
      boxSizing: "border-box",
      height: "32px",
      minWidth: "10px",
      padding: "8px 24px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightRegular as any,
      fontSize: "16px",
    },
    SecondarySmallDisabled: {
      backgroundColor: allColor.background,
      color: allColor.lighterBorder,
      borderStyle: "solid",
      borderWidth: "0.5px",
      borderColor: allColor.inactive,
      boxSizing: "border-box",
      height: "24px",
      minWidth: "10px",
      padding: "4px 8px",
      borderRadius: "2px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
    },
    SecondarySmallIcon: {
      backgroundColor: allColor.lightFill,
      color: allColor.primaryColor,
      height: "24px",
      padding: "4px 8px",
      borderRadius: "2px",
      minWidth: "10px",
      fontFamily: "PingFang SC, sans-serif",
      fontWeight: theme.typography.fontWeightMedium as any,
      fontSize: "14px",
    },
    NoHoverBorderButton: {
      "&:hover": {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    NoHoverBorderButtonSmall: {
      width: "9px",
      minWidth: "9px",
      height: "24px",
      padding: "0",
      "&:hover": {
        backgroundColor: "transparent",
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
  })
);

const cardStyles = makeStyles((theme: Theme) =>
  createStyles({
    Primary: {
      backgroundColor: allColor.accentBackground,
      height: "72px",
      width: "712px",
      marginTop: "8px",
    },
  })
);

const boxStyles = makeStyles((theme: Theme) =>
  createStyles({
    PrimaryTemplateCreate: {
      backgroundColor: allColor.primaryColor,
      color: "white",
      height: "24px",
      padding: "2px 14px",
      borderRadius: "2px",
    },
    SecondTemplateCreate: {
      backgroundColor: "transparent",
      color: allColor.bodyText,
      marginLeft: "16px",
      padding: "2px 0px",
    },
    Text: {
      backgroundColor: allColor.darkFill,
      height: "24px",
      width: "396px",
      borderRadius: "2px",
    },
    NumberRangeStart: {
      backgroundColor: allColor.darkFill,
      height: "24px",
      width: "58px",
      borderRadius: "2px",
    },
    NumberRangeEnd: {
      backgroundColor: allColor.darkFill,
      marginLeft: "12px",
      height: "24px",
      width: "58px",
      borderRadius: "2px",
    },
    File: {
      backgroundColor: allColor.darkFill,
      height: "52px",
      width: "52px",
      borderRadius: "2px",
    },
  })
);

const radioStyles = makeStyles((theme: Theme) =>
  createStyles({
    Primary: {
      color: allColor.border,
      "&.Mui-checked": {
        color: allColor.primaryColor,
      },
    },
  })
);

const checkboxStyles = makeStyles((theme: Theme) =>
  createStyles({
    Primary: {
      color: allColor.border,
      "&.Mui-checked": {
        color: allColor.primaryColor,
      },
    },
  })
);

const commonProps = {
  Border: {
    border: 1,
    borderLeft: 3,
    borderRight: 3,
  },
  buttonDisable: {
    disableRipple: true,
    disableElevation: true,
    disableFocusRipple: true,
  },
};

const exportCommon = {
  wordTemplateId,
  fontStyles,
  buttonStyles,
  cardStyles,
  boxStyles,
  radioStyles,
  checkboxStyles,
  allColor,
  iconSize,
  commonProps,
};

export default exportCommon;
