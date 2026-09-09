sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState"
], function (Controller, MessageToast, ValueState) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.Register", {

        onInit: function () {
            // Focus on username input when the view is loaded
            this.getView().addEventDelegate({
                onAfterShow: function () {
                    this.byId("regUsernameInput").focus();
                }.bind(this)
            });
        },

        onRegisterSubmit: function () {
            var oUsernameInput = this.byId("regUsernameInput");
            var oPasswordInput = this.byId("regPasswordInput");
            var oConfirmPasswordInput = this.byId("regConfirmPasswordInput");
            var oErrorStrip = this.byId("regErrorMessage");

            var sUsername = oUsernameInput.getValue().trim();
            var sPassword = oPasswordInput.getValue().trim();
            var sConfirmPassword = oConfirmPasswordInput.getValue().trim();

            oUsernameInput.setValueState(ValueState.None);
            oPasswordInput.setValueState(ValueState.None);
            oConfirmPasswordInput.setValueState(ValueState.None);
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

            if (!sConfirmPassword) {
                oConfirmPasswordInput.setValueState(ValueState.Error);
                oConfirmPasswordInput.setValueStateText("Please confirm your password");
                bValid = false;
            }

            if (sPassword && sConfirmPassword && sPassword !== sConfirmPassword) {
                oConfirmPasswordInput.setValueState(ValueState.Error);
                oConfirmPasswordInput.setValueStateText("Passwords do not match");
                bValid = false;
            }

            if (!bValid) {
                return;
            }

            this.getView().setBusy(true);

          
            var oPayload = {
                UserName: sUsername,
                Password: sPassword
            };

            var oModel = this.getOwnerComponent().getModel();

            oModel.create("/UserSet", oPayload, {
                success: function () {
                    this.getView().setBusy(false);
                    MessageToast.show("Account created successfully! Please sign in.");

                    // Reset form fields
                    oUsernameInput.setValue("");
                    oPasswordInput.setValue("");
                    oConfirmPasswordInput.setValue("");

                    // Navigate back to Login view
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    var sErrorMsg = "Failed to create account. Please try again.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sErrorMsg = oResponse.error.message.value;
                    } catch (e) {
                       
                    }

                    oErrorStrip.setText(sErrorMsg);
                    oErrorStrip.setVisible(true);
                }.bind(this)
            });
        },

        onNavBack: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Login", {}, true);
        }
    });
});
