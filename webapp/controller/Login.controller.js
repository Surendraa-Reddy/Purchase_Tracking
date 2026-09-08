sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState"
], function (Controller, MessageToast,  Fragment, ValueState) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.Login", {

        onInit: function () {
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

            var sUsername = oUsernameInput.getValue().trim();
            var sPassword = oPasswordInput.getValue().trim();

            oUsernameInput.setValueState(ValueState.None);
            oPasswordInput.setValueState(ValueState.None);
            oErrorStrip.setVisible(false);

            // 1. Input Validation
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

            
            var oModel = this.getOwnerComponent().getModel();

           
            var sPath = oModel.createKey("/UserSet", {
                UserName: sUsername
            });

         
            oModel.read(sPath, {
                headers: {
                    "x-user-password": sPassword
                },
                success: function (oData) {
                    this.getView().setBusy(false);
                    MessageToast.show("Welcome back, " + (oData.UserName || oData.user_name) + "!");

                    oUsernameInput.setValue("");
                    oPasswordInput.setValue("");

                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.navTo("Dashboard");
                }.bind(this),
                error: function (oError) {
                    this.getView().setBusy(false);
                    var sErrorMsg = "Invalid Username or Password.";

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

        onRegister: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Register");
        },

        
        onForgotPassword: function () {
            var oView = this.getView();

          
            if (!this._pResetPasswordDialog) {
                this._pResetPasswordDialog = Fragment.load({
                    id: oView.getId(),
                    name: "purchaseordertracking.zpomanagementapp.view.fragments.ResetPasswordDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._pResetPasswordDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        _handlePasswordResetSubmit: function () {
            var sUsername = this.byId("resetUsernameInput").getValue();
            var sNewPassword = this.byId("resetNewPasswordInput").getValue();
            var sConfirmPassword = this.byId("resetConfirmPasswordInput").getValue();
            if (!sUsername || !sNewPassword || !sConfirmPassword) {
                MessageBox.error("Please fill in all mandatory fields.");
                return;
            }
            if (sNewPassword !== sConfirmPassword) {
                MessageBox.error("The new passwords do not match. Please re-enter.");
                return;
            }
            if (sNewPassword.length < 8) {
                MessageBox.warning("Password must be at least 8 characters long.");
                return;
            }
            this._onCloseResetDialog();
            MessageToast.show("Password updated successfully! Please sign in.", {
                duration: 4000
            });
        
            this.byId("usernameInput").setValue(sUsername);
            this.byId("passwordInput").setValue("");
        },

        _onCloseResetDialog: function () {
            this._pResetPasswordDialog.then(function (oDialog) {
                oDialog.close();
            });
        }

    });
});

