import React from "react";

import { states } from "./helpers.js";

import {
    StyleRoadmap,
    StyleRoadmapTitle,
    StyleRoadmapLine,
    StyleRoadmapState,
    StyleStateHeader,
    StyleStateTitle,
    StyleStateList,
    StyleStateListItem
} from './style';

import roadmapLine from "assets/images/roadmap-line.svg";

const statestLength = states.length;

export default () => (
    <StyleRoadmap id="roadmap">
        <StyleRoadmapTitle>ROADMAP</StyleRoadmapTitle>
        {states.map((state, index) => (
          <StyleRoadmapState key={state.state}>
              <div className="state">
                <StyleStateHeader>
                  <StyleStateTitle className="state">{state.state}</StyleStateTitle>
                  <h4>{state.title}</h4>
                  <h4>{state.date}</h4>
                  {(index < statestLength-1) &&
                    <StyleRoadmapLine/>
                  }
                </StyleStateHeader>
                <StyleStateList className="list">
                  {state.descriptions.map((description, index) => (
                    <div className="list-item"  key={state.state + '_' + index}>
                        <StyleStateListItem>{description}</StyleStateListItem>
                    </div>
                  ))}
                </StyleStateList>
              </div>
          </StyleRoadmapState>
        ))}
    </StyleRoadmap>
);
