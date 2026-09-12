sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (Controller, MessageToast, MessageBox, ValueState, History, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.CreatePoHeader", {

        onInit: function () {
            this.byId("docDatePicker").setDateValue(new Date());
        },


        onInputChange: function (oEvent) {
            var oInput = oEvent.getSource();
            if (oInput.getValue().trim()) {
                oInput.setValueState(ValueState.None);
                oInput.setValueStateText("");
            }
        },

        onSavePO: function () {
            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel();

            var oDate = oView.byId("docDatePicker").getDateValue();
            var sFormattedDate = oDate ? oDate.toISOString().split('T')[0] + "T00:00:00" : null;

            var oPayload = {
                PoId: oView.byId("poIdInput").getValue().trim(),
                CompanyCode: oView.byId("companyCodeInput").getValue().trim(),
                VendorId: oView.byId("vendorInput").getValue().trim(),
                PoDate: sFormattedDate,
                PurOrg: oView.byId("purchOrgInput").getValue().trim(),
                PurGroup: oView.byId("purchGroupInput").getValue().trim(),
                Currency: oView.byId("currencySelect").getSelectedKey(),
                TotalAmount: "0.00"
            };


            if (!this._validateInputs(oPayload)) {
                MessageBox.error("Please correct the highlighted errors before saving.");
                return;
            }

            oView.setBusy(true);

            oModel.create("/POHeaderSet", oPayload, {
                success: function (oData) {
                    oView.setBusy(false);
                    var sPoNum = oData.PoId || "Created Successfully";

                    MessageBox.success("Purchase Order Header " + sPoNum + " generated successfully.", {
                        onClose: function () {
                            this.onNavBack();
                        }.bind(this)
                    });
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    var sErrorMsg = "Error creating Purchase Order Header.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sErrorMsg = oResponse.error.message.value;
                    } catch (e) {

                    }

                    MessageBox.error(sErrorMsg);
                }.bind(this)
            });
        },

        _validateInputs: function (oPayload) {
            var bValid = true;


            var aRequiredFields = [
                { id: "poIdInput", val: oPayload.PoId, msg: "PO ID is required." },
                { id: "vendorInput", val: oPayload.VendorId, msg: "Vendor ID is required." },
                { id: "purchOrgInput", val: oPayload.PurOrg, msg: "Purchasing Organization is required." },
                { id: "purchGroupInput", val: oPayload.PurGroup, msg: "Purchasing Group is required." },
                { id: "companyCodeInput", val: oPayload.CompanyCode, msg: "Company Code is required." }
            ];

            aRequiredFields.forEach(function (oField) {
                var oControl = this.byId(oField.id);

                if (!oField.val) {
                    oControl.setValueState(ValueState.Error);
                    oControl.setValueStateText(oField.msg);
                    bValid = false;
                } else {
                    oControl.setValueState(ValueState.None);
                    oControl.setValueStateText("");
                }
            }, this);


            var oDatePicker = this.byId("docDatePicker");
            if (!oDatePicker.getDateValue()) {
                oDatePicker.setValueState(ValueState.Error);
                oDatePicker.setValueStateText("Document Date is required.");
                bValid = false;
            } else {
                oDatePicker.setValueState(ValueState.None);
            }

            return bValid;
        },

        onVendorValueHelp: function (oEvent) {
            var oView = this.getView();
            this._oVendorInput = oEvent.getSource(); 

            if (!this._oVendorValueHelpDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "purchaseordertracking.zpomanagementapp.view.fragments.VendorValueHelpDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oVendorValueHelpDialog = oDialog;
                    oView.addDependent(this._oVendorValueHelpDialog);
                    this._oVendorValueHelpDialog.open();
                }.bind(this));
            } else {
                this._oVendorValueHelpDialog.open();
            }
        },

        onVendorValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter([
                new Filter("VendorId", FilterOperator.Contains, sValue),
                new Filter("VendorName", FilterOperator.Contains, sValue)
            ], false);

            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(sValue ? [oFilter] : []);
        },

        onVendorValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem && this._oVendorInput) {
                var sVendorId = oSelectedItem.getDescription();

                this._oVendorInput.setValue(sVendorId);
                this._oVendorInput.setValueState("None"); 
            }
        },

        onVendorValueHelpClose: function (oEvent) {
            var oBinding = oEvent.getSource().getBinding("items");
            if (oBinding) {
                oBinding.filter([]); 
            }
        },

        onCancel: function () {
            this._resetHeaderValidation();
            this.onNavBack();
        },

        _resetHeaderValidation: function () {
            // Array of Input IDs in the Header Information section
            var aHeaderInputIds = [
                "poIdInput",
                "vendorInput",
                "purchOrgInput",
                "purchGroupInput",
                "companyCodeInput",
                "documentDateInput",
                "currencySelect"
            ];

            aHeaderInputIds.forEach(function (sId) {
                var oControl = this.byId(sId);
                if (oControl && oControl.setValueState) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            }, this);
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Dashboard", {}, true);
            }
        }

    });
});