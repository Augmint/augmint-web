import styled from "styled-components";
import theme from "styles/theme";

const BaseDiv = `
    background: none transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    font-size: 1rem;
    margin: 1rem 0;
    padding: 1em;
    position: relative;

    &:first-child {
    margin-top: 0;
  }
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
`;
