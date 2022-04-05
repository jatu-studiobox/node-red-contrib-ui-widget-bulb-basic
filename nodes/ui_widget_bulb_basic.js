module.exports = function (RED) {
    function HTML(config) {
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
    height: 200px;
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
    background: #fff;
    box-shadow: 0 0 50px #fff,
    0 0 100px #fff,
    0 0 150px #fff,
    0 0 200px #fff,
}
.bulb::before {
    content: '';
    position: absolute;
    top: -50px;
    left: 22.5px;
    width: 35px;
    height: 80px;
    background: #444;
    border-top: 30px solid #000;
    border-radius: 10px;
}
.on .bulb::before {
    background: #fff;
}
.on .bulb::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: #fff;
    border-radius: 50%;
    filter: blur(40px);
}
.bulb span:nth-child(1) {
    position: absolute;
    top: -16px;
    left: -4px;
    display: block;
    width: 30px;
    height: 30px;
    background: transparent;
    transform: rotate(342deg);
    border-bottom-right-radius: 40px;
    box-shadow: 20px 20px 0 10px #444;
}
.on .bulb span:nth-child(1) {
    box-shadow: 20px 20px 0 10px #fff;
}
.bulb span:nth-child(2) {
    position: absolute;
    top: -16px;
    right: -4px;
    display: block;
    width: 30px;
    height: 30px;
    background: transparent;
    transform: rotate(17deg);
    border-bottom-left-radius: 40px;
    box-shadow: -20px 20px 0 10px #444;
}
.on .bulb span:nth-child(2) {
    box-shadow: -20px 20px 0 10px #fff;
}
.wire {
    position: absolute;
    left: calc(50% - 2px);
    bottom: 50%;
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
<div id="item_{{$id}}">
    <div>
        <div class="light">
            <div class="wire"></div>
            <div class="bulb">
                <span></span>
                <span></span>
            </div>
        </div>
    </div>` + displayTitle + `<span class="error" style="visibility:hidden;"></span>
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
                        $scope.flag = true;     // not sure if this is needed?
                        $scope.$watch('msg', function (msg) {
                            if (!msg) {
                                // Ignore undefined msg
                                return;
                            }
                            // Gathering payload
                            const payload = msg.payload;
                            const bulbWidget = document.getElementById("item_" + $scope.$eval('$id'));
                            const error = $(bulbWidget).find(".error");
                            $(error).text("");
                            $(error).css('visibility', 'hidden');
                            // Validate payload
                            if (msg.isErr) {
                                $(error).text("Error: " + msg.errMessage);
                                $(error).css('visibility', 'visible');
                            } else {
                                const light = $(bulbWidget).find(".light");
                                if (payload) {
                                    $(light).addClass("on");
                                } else {
                                    $(light).removeClass("on");
                                }
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