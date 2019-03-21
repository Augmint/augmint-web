const theme = {
    colors: {
        white: "white",
        black: "black",
        grey: "#e0e1e2",
        mediumGrey: "#828282",
        lightGrey: "#e8e8e8",
        opacGrey: "rgba(34,36,38,.15)",
        opacExtraLighterGrey: "rgba(0,0,0,.05)",
        opacLighterGrey: "rgba(0,0,0,.6)",
        opacLightGrey: "rgba(0,0,0,.8)",
        opacBlack: "rgba(0,0,0,.95)",
        opacWhite: "rgba(255, 255, 255, 0.5)",
        opacLightWhite: "rgba(255, 255, 255, 0.1)",
        primary: "#051d2d",
        primaryLight: "#2e3438",
        secondaryLight: "#f9db9c",
        secondary: "#ffad00",
        // secondaryDark: "#d99300",
        secondaryDark: "#e29a00",
        lightCyan: "#f8ffff",
        darkCyan: "#276f86",
        red: "#eb5757",
        lightRed: "#fff6f6",
        mediumRed: "#ffa9a9",
        // ffbbbb
        darkRed: "#9f3a38",
        green: "green",
        lightGreen: "#fcfff5",
        darkGreen: "#2c662d"
    },
    chartColors: {
        blue: "rgba(54, 162, 235, 1)",
        orange: "rgba(255, 159, 64, 1)",
        red: "rgba(255,99,132,1)",
        green: "rgba(75, 192, 192, 1)"
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
            default: "'Roboto', sans-serif",
            currency: "'Roboto Mono', monospace",
            title: "'Roboto Slab', serif"
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
        right: "0 3px 3px 0",
        left: "3px 0 0 3px",
        top: "3px 3px 0 0",
        all: "3px"
    }
};

export default theme;

export function remCalc(pixelSize) {
    const remCorrection = 16 / 16;

    return (pixelSize / 16) * remCorrection + "rem";
}
