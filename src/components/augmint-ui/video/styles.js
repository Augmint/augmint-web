import styled from "styled-components";

const Base = `
    height: calc(75vw - 100px);
    max-height: 360px;
    max-width: 640px;
`;

export const StyledIframe = styled.iframe`
    ${Base};
`;
