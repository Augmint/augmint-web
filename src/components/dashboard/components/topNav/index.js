import React from 'react';

import Icon from "components/augmint-ui/icon";
import { BaseUl} from "components/augmint-ui/list";

import { StyledTopNav, StyledTopNavLi, StyledTopNavLink } from './styles';

export default () => (
    <StyledTopNav>
        <BaseUl>
            <StyledTopNavLi>
                <StyledTopNavLink>
                    <Icon name="connect" />
                </StyledTopNavLink>
            </StyledTopNavLi>
        </BaseUl>
    </StyledTopNav>
);
