const theme = {
    colors: {
        white: "white",
        grey: "#e0e1e2",
        mediumGrey: "#767676",
        lightGrey: "#e8e8e8",
        opacGrey: "rgba(34,36,38,.15)",
        opacExtraLighterGrey: "rgba(0,0,0,.05)",
        opacLighterGrey: "rgba(0,0,0,.6)",
        opacLightGrey: "rgba(0,0,0,.8)",
        opacBlack: "rgba(0,0,0,.95)",
        opacWhite: "rgba(255, 255, 255, 0.5)",
        opacLightWhite: "rgba(255, 255, 255, 0.1)",
        primary: "#051d2d",
        secondary: "#ffad00",
        secondaryDark: "#d99300",
        lightCyan: "#f8ffff",
        darkCyan: "#276f86",
        red: "red",
        lightRed: "#fff6f6",
        darkRed: "#9f3a38",
        green: "green",
        lightGreen: "#fcfff5",
        darkGreen: "#2c662d"
    },
    transitions: {
        standard: "0.3s ease-in",
        fast: "0.1s ease"
    },
    pageSize: {
        maxSize: "1127px"
    },
    typography: {
        fontFamilies: {
            default: "MaisonNeue,'Helvetica Neue',Arial,Helvetica,sans-serif"
        },
        fontSizes: {
            h5: remCalc(12),
            h4: remCalc(24),
            h3: remCalc(26),
            h2: remCalc(34),
            h1: remCalc(34)
        }
    },
    borderRadius: {
        right: "0 5px 5px 0",
        left: "5px 0 0 5px",
        top: "5px 5px 0 0",
        all: "5px"
    }
};

export default theme;

export function remCalc(pixelSize) {
    const remCorrection = 16 / 16;

    return (pixelSize / 16) * remCorrection + "rem";
}
