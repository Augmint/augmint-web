import React from "react";

import "./style.css";

export default class Contact extends React.Component {
    componentWillMount () {
        const script = document.createElement("script");

        script.src = "https://r3.minicrm.hu/api/minicrm.js?t=1517502740";
        script.async = true;

        document.body.appendChild(script);
  }
    render() {
        return (
          <div className="contact-us" style={{ height: "100%", width: "100%" }}>
            <form FormHash="20916-1ltpzoohjm2iaaaagjn9" action="https://r3.minicrm.hu/Api/Signup" method="post" class="TurnKeyCRM Custom">
            <fieldset>
              <legend>Need more information</legend>
              <div class='InputBlock'>
                <label for="Contact_Email_4434" class="Required">Email</label>
                <input  name="Contact[4434][Email]" id="Contact_Email_4434" language="EN" type="text" />
              </div>

              <div class='InputBlock'>
                <label for="Contact_FirstName_4434" class="Required">First name/nick name</label>
                <input  name="Contact[4434][FirstName]" id="Contact_FirstName_4434" language="EN" type="text" />
              </div>

              <div class='InputBlock'>
                <label for="Project_WhichFunctionAreYouInterestedIn_4432" >Which function are you interested in?</label>
                <select  name="Project[4432][WhichFunctionAreYouInterestedIn]" id="Project_WhichFunctionAreYouInterestedIn_4432" language="EN">
                  <option selected value=""></option>
                  <option value="4744">Ether backed LOAN</option>
                  <option value="4745">Locking for premium</option>
                  <option value="4746">Payments  spending</option>
                </select>
              </div>

              <div class='InputBlock'>
                <label for="Project_IWantToTakePartInTheProject_4432" >I want to take part in the project</label>
                <select  name="Project[4432][IWantToTakePartInTheProject]" id="Project_IWantToTakePartInTheProject_4432" language="EN">
                  <option selected value=""></option>
                  <option value="4756">Yes  I like the project and want to move forward</option>
                  <option value="4757">No  thank you</option>
                </select>
              </div>

              <div class='InputBlock'>
                <label for="Project_Notes_4432" >Notes</label>
                <textarea  name="Project[4432][Notes]" id="Project_Notes_4432" language="EN"></textarea>
              </div>


            </fieldset>


            <div id="Response_20916-1ltpzoohjm2iaaaagjn9" style={{display: "none"}} class="Response"></div>
            <input id="Submit_20916-1ltpzoohjm2iaaaagjn9" type="submit" value="SEND" />
            </form>
          </div>
        );
    }
}
