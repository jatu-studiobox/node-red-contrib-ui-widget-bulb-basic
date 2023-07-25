module.exports = function (RED) {
    function HTML(config) {
        const configAsJson = JSON.stringify(config);
        const bulbColor = config.color;
        const scale = config.scale;
        let blubScale = "";
        let lightHeight = "200px";
        let wireBottom = "50%";
        if (typeof scale === 'undefined' || scale === null) {
          blubScale = "bulb";
        } else {
          if (scale === "small") {
            blubScale = "bulbsmall";
            lightHeight = "100px";
            wireBottom = "75%";
          } else {
            blubScale = "bulb";
          }
        }
        let displayTitle = "";
        if (config.title !== "") {
            displayTitle = "<div style='font-size: 1.2em;font-weight:bold;text-align: center;margin-top: 10px'>" + config.title + "</div>";
        }
        const html = String.raw`<style>
.light {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: ` + lightHeight + `;
    background: #222;
}
.on {
    background: radial-gradient(#555, #111);
}
.bulb {
    position: relative;
    width: 80px;
    height: 80px;
    background: #444;
    border-radius: 50%;
    z-index: 2;
}
.on .bulb {
    background: ` + bulbColor + `;
    box-shadow: 0 0 50px ` + bulbColor + `,
    0 0 100px ` + bulbColor + `,
    0 0 150px ` + bulbColor + `,
    0 0 200px ` + bulbColor + `,
}
.bulb::before {
    content: '';
    position: absolute;
    top: -25px;
    left: 22.5px;
    width: 35px;
    height: 40px;
    background: #444;
    border-top: 20px solid #000;
    border-radius: 10px;
}
.on .bulb::before {
    background: ` + bulbColor + `;
}
.on .bulb::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: ` + bulbColor + `;
    border-radius: 50%;
    filter: blur(40px);
}
.bulb span:nth-child(1) {
    position: absolute;
    top: -17px;
    left: 0px;
    display: block;
    width: 23px;
    height: 31px;
    background: transparent;
    border-bottom-right-radius: 40px;
    box-shadow: 14px 14px 0 0px #444;
}
.on .bulb span:nth-child(1) {
    box-shadow: 14px 14px 0 0px ` + bulbColor + `;
}
.bulb span:nth-child(2) {
    position: absolute;
    top: -17px;
    right: 0px;
    display: block;
    width: 23px;
    height: 31px;
    background: transparent;
    border-bottom-left-radius: 40px;
    box-shadow: -14px 14px 0 0px #444;
}
.on .bulb span:nth-child(2) {
    box-shadow: -14px 14px 0 0px ` + bulbColor + `;
}
.bulbsmall {
  position: relative;
  width: 40px;
  height: 40px;
  background: #444;
  border-radius: 50%;
  z-index: 2;
}
.on .bulbsmall {
  background: ` + bulbColor + `;
  box-shadow: 0 0 25px ` + bulbColor + `,
    0 0 50px ` + bulbColor + `,
    0 0 75px ` + bulbColor + `,
    0 0 100px ` + bulbColor + `,
}
.bulbsmall::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 11.25px;
  width: 17.5px;
  height: 20px;
  background: #444;
  border-top: 10px solid #000;
  border-radius: 5px;
}
.on .bulbsmall::before {
  background: ` + bulbColor + `;
}
.on .bulbsmall::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: ` + bulbColor + `;
  border-radius: 50%;
  filter: blur(25px);
}
.bulbsmall span:nth-child(1) {
  position: absolute;
  top: -19px;
  left: -10px;
  display: block;
  width: 21px;
  height: 34px;
  background: transparent;
  border-bottom-right-radius: 40px;
  box-shadow: 14px 14px 0 0px #444;
}
.on .bulbsmall span:nth-child(1) {
  box-shadow: 14px 14px 0 0px ` + bulbColor + `;
}
.bulbsmall span:nth-child(2) {
  position: absolute;
  top: -19px;
  right: -10px;
  display: block;
  width: 21px;
  height: 34px;
  background: transparent;
  border-bottom-left-radius: 40px;
  box-shadow: -14px 14px 0 0px #444;
}
.on .bulbsmall span:nth-child(2) {
  box-shadow: -14px 14px 0 0px ` + bulbColor + `;
}
.wire {
    position: absolute;
    left: calc(50% - 2px);
    bottom: ` + wireBottom + `;
    width: 4px;
    height: 60vh;
    background: #000;
    z-index: 1;
}
.error {
    color: red;
    width: 100%;
    text-align: center;
}
</style>
<div id="bulb_item_{{$id}}">
    <div>
        <div class="light">
            <div class="wire"></div>
            <div class="` + blubScale + `">
                <span></span>
                <span></span>
            </div>
        </div>
    </div>` + displayTitle + `<span class="error" style="visibility:hidden;"></span>
    <input type='hidden' ng-init='init(` + configAsJson + `)'>
</div>`;
        return html;
    }
    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * This function will verify that the configuration is valid
     * by making sure the node is part of a group. If it is not,
     * it will throw a "no-group" error.
     * You must enter your node name that you are registering here.
     */
    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("ui_widget_bulb_basic.errors.no-group"));
            return false;
        }
        return true;
    }

    let ui = undefined; // instantiate a ui variable to link to the dashboard

    // Function validate payload value
    function validatePayload(msg) {
        let result = {
            isError: false,
            message: ""
        };
        // validate payload section
        if (typeof msg.payload !== 'undefined') {
            if (typeof msg.payload !== 'boolean') {
                result.isError = true;
                result.message = RED._("ui_widget_bulb_basic.errors.payloadInvalid");
            }
        } else {
            result.isError = true;
            result.message = RED._("ui_widget_bulb_basic.errors.payloadRequired");
        }
        return result;
    }

    /**
     * REQUIRED
     * A ui-node must always contain the following function.
     * function YourNodeNameHere(config){}
     * This function will set the needed variables with the parameters from the flow editor.
     * It also will contain any Javascript needed for your node to function.
     *
     */
    function UiWidgetBulbBasic(config) {
        let node = this;
        let done = null;
        try {
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);

            // placing a "debugger;" in the code will cause the code to pause its execution in the web browser
            // this allows the user to inspect the variable values and see how the code is executing
            //debugger;

            if (checkConfig(node, config)) {
                const html = HTML(config);                    // *REQUIRED* get the HTML for this node using the function from above
                done = ui.addWidget({                       // *REQUIRED* add our widget to the ui dashboard using the following configuration
                    node: node,                             // *REQUIRED*
                    order: config.order,                    // *REQUIRED* placeholder for position in page
                    group: config.group,                    // *REQUIRED*
                    width: config.width,                    // *REQUIRED*
                    height: config.height,                  // *REQUIRED*
                    format: html,                           // *REQUIRED*
                    templateScope: "local",                 // *REQUIRED*
                    emitOnlyNewValues: false,               // *REQUIRED*
                    forwardInputMessages: false,            // *REQUIRED*
                    storeFrontEndInputAsState: false,       // *REQUIRED*
                    convertBack: function (value) {
                        return value;
                    },
                    beforeEmit: function (msg) {
                        // Validate payload
                        const result = validatePayload(msg);
                        if (result.isError) {
                            msg.isErr = true;
                            msg.errMessage = result.message;
                        } else {
                            msg.isErr = false;
                        }
                        return {
                            msg: msg
                        };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return orig.msg;
                        }
                    },
                    initController: function ($scope) {
                        let divWidget;
                        // Add scope variables for switching tab
                        $scope.inited = false;
                        $scope.status = false;
                        $scope.flag = true;     // not sure if this is needed?

                        const setLight = function (bulbWidget, status, isErr, errMessage) {
                            // Gather light's bulb
                            const light = $(bulbWidget).find(".light");
                            
                            // Hide error section
                            const error = $(bulbWidget).find(".error");
                            $(error).text("");
                            $(error).css('visibility', 'hidden');

                            // Validate error
                            if (isErr) {
                                // set display error section
                                $(error).text("Error: " + errMessage);
                                $(error).css('visibility', 'visible');
                                // light off for error
                                $(light).removeClass("on");
                            } else {
                                // set light status
                                if (status) {
                                    $(light).addClass("on");
                                } else {
                                    $(light).removeClass("on");
                                }
                            }
                        }
                        // init widget
                        $scope.init = function (config) {
                            $scope.config = config;
                            divWidget = '#bulb_item_' + $scope.$eval('$id');
                            let stateCheck = setInterval(function () {
                                if (document.querySelector(divWidget) && $scope.status) {
                                    clearInterval(stateCheck);
                                    $scope.inited = true;
                                    setLight(divWidget, $scope.status, false, "");
                                    $scope.percentHumid = false;
                                }
                            }, 40);
                        };
                        // watch payload message
                        $scope.$watch('msg', function (msg) {
                            if (!msg) {
                                // Ignore undefined msg
                                return;
                            }
                            if (msg && msg.hasOwnProperty("payload") && typeof msg.payload === 'boolean') {
                                if ($scope.inited === false) {
                                    // Gathering payload
                                    $scope.status = msg.payload;
                                    return;
                                }
                                setLight(divWidget, msg.payload, msg.isErr, msg.errMessage);
                            }
                        });
                    }
                });
            }
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.warn(e);		// catch any errors that may occur and display them in the web browsers console
        }

        /**
         * REQUIRED
         * I'm not sure what this does, but it is needed.
         */
        node.on("close", function () {
            if (done) {
                done();
            }
        });
    }

    RED.nodes.registerType("ui_widget_bulb_basic", UiWidgetBulbBasic);
};