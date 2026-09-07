sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState"
], function (Controller, MessageToast, ValueState) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.Login", {

        onInit: function () {
            // Optional: Auto-focus the username field on view display
            this.getView().addEventDelegate({
                onAfterShow: function () {
                    this.byId("usernameInput").focus();
                }.bind(this)
            });
        },

        onLogin: function () {
            var oUsernameInput = this.byId("usernameInput");
            var oPasswordInput = this.byId("passwordInput");
            var oErrorStrip = this.byId("loginErrorMessage");
            var oBtn = this.byId("btnLogin");

            var sUsername = oUsernameInput.getValue().trim();
            var sPassword = oPasswordInput.getValue().trim();

            // Reset validation states
            oUsernameInput.setValueState(ValueState.None);
            oPasswordInput.setValueState(ValueState.None);
            oErrorStrip.setVisible(false);

            
            var bValid = true;
            if (!sUsername) {
                oUsernameInput.setValueState(ValueState.Error);
                oUsernameInput.setValueStateText("Username is required");
                bValid = false;
            }
            if (!sPassword) {
                oPasswordInput.setValueState(ValueState.Error);
                oPasswordInput.setValueStateText("Password is required");
                bValid = false;
            }

            if (!bValid) {
                return;
            }

           
            this.getView().setBusy(true);

           
            setTimeout(function () {
                this.getView().setBusy(false);

                if (sUsername.toUpperCase() === "DEMO" && sPassword === "demo") {
                    MessageToast.show("Welcome back!");

                   
                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Dashboard");
                } else {
                  
                    oErrorStrip.setText("Invalid credentials. Please try 'DEMO' / 'demo'.");
                    oErrorStrip.setVisible(true);
                }
            }.bind(this), 1000);
        },

        onForgotPassword: function () {
            MessageToast.show("Please contact your SAP system administrator to reset your password.");
        }
    });
});