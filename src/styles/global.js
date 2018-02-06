import { injectGlobal } from 'styled-components';


injectGlobal`
    @font-face {
        font-family: 'MaisonNeue';
        src: local('MaisonNeue'), url(fonts/MaisonNeue-Book.woff) format('woff');
        src: local('MaisonNeue'), url(fonts/MaisonNeue-Book.woff2) format('woff2');
      }
`;
