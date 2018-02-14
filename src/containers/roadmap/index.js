import React from "react";

import { states } from "./helpers.js";
import "./style.css";

import roadmapLine from "assets/images/roadmap-line.svg";

const statestLength = states.length;

export default () => (
    <div id="roadmap">
        {states.map((state, index) => (
          <div key={state.state}>
              <div className="state">
                  <h4>{state.state}</h4>
                  <h4>{state.title}</h4>
                  <h5>{state.date}</h5>
                  {state.descriptions.map((description, index) => (
                    <p key={state.state + '_' + index}>{description}</p>
                  ))}
              </div>
              {(index < statestLength-1) &&
                  <img alt="separator" src={roadmapLine} style={{padding: '0 135px'}}/>
              }
          </div>
        ))}
    </div>
);
