import React from "react";

import { states } from "./helpers.js";

import {
    StyleRoadmap,
    StyleRoadmapTitle,
    StyleRoadmapLine,
    StyleRoadmapState,
    StyleStateHeader,
    StyleStateList
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
                  <h2 className="state">{state.state}</h2>
                  <h3>{state.title}</h3>
                  <h4>{state.date}</h4>
                </StyleStateHeader>
                <StyleStateList className="list">
                  {state.descriptions.map((description, index) => (
                    <div className="list-item"  key={state.state + '_' + index}>
                        <p>{description}</p>
                    </div>
                  ))}
                </StyleStateList>
              </div>
              {(index < statestLength-1) &&
                <StyleRoadmapLine alt="separator" src={roadmapLine} />
              }
          </StyleRoadmapState>
        ))}
    </StyleRoadmap>
);
