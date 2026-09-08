sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox"
], function (Controller, MessageBox) {
  "use strict";

  return Controller.extend("purchaseordertracking.zpomanagementapp.controller.App", {

    onLogout: function () {
      var oRouter = this.getOwnerComponent().getRouter();

      MessageBox.confirm("Are you sure you want to log out?", {
        title: "Logout Confirmation",
        onClose: function (oAction) {
          if (oAction === MessageBox.Action.OK) {
            // Clear any stored user/session data if applicable
            // sap.ui.getCore().getModel("userModel").setData({});

            oRouter.navTo("Login", {}, true /* replace history entry */);
          }
        }
      });
    }
  });
});
