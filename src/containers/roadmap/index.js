import React from "react";

import { states } from "./helpers.js";
import "./style.css";

import {
    StyleRoadmap,
    StyleRoadmapLine,
    StyleRoadmapState
} from './style';

import roadmapLine from "assets/images/roadmap-line.svg";

const statestLength = states.length;

export default () => (
    <StyleRoadmap id="roadmap">
        {states.map((state, index) => (
          <div key={state.state}>
              <StyleRoadmapState className="state">
                  <h4 className="state">{state.state}</h4>
                  <h4>{state.title}</h4>
                  <h5>{state.date}</h5>
                  {state.descriptions.map((description, index) => (
                    <p key={state.state + '_' + index}>{description}</p>
                  ))}
              </StyleRoadmapState>
              {(index < statestLength-1) &&
                  <StyleRoadmapLine alt="separator" src={roadmapLine} />
              }
          </div>
        ))}
    </StyleRoadmap>
);
