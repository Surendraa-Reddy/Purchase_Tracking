sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.PurchaseOrderHeader", {

        onSearch: function () {
            var aFilters = [];


            var sPoId = this.byId("filterPoId").getValue().trim();
            var sVendor = this.byId("filterVendor").getValue().trim();
            var sStatus = this.byId("filterStatus").getSelectedKey();


            if (sPoId) {
                aFilters.push(new sap.ui.model.Filter("PoId", sap.ui.model.FilterOperator.Contains, sQuery));
            }


            if (sVendor) {
                aFilters.push(new Filter("VendorId", FilterOperator.Contains, sVendor));
            }


            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }


            var oTable = this.byId("managePoTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onResetFilters: function () {
            this.byId("filterPoId").setValue("");
            this.byId("filterVendor").setValue("");
            this.byId("filterStatus").setSelectedKey("");
            this.onSearch();
        },

        onRefresh: function () {

            this.byId("filterPoId").setValue("");
            this.byId("filterVendor").setValue("");
            this.byId("filterStatus").setSelectedKey("");


            var oTable = this.byId("managePoTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter([]);
                oBinding.refresh();
            }


            MessageToast.show("Search fields cleared and data refreshed.");
        },

        onCreatePo: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("CreatePoHeader"); 
        },

        onDeleteSelected: function () {
            var oTable = this.byId("managePoTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Please select at least one Purchase Order to delete.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected item(s)?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageToast.show(aSelectedItems.length + " PO(s) deleted.");
                    }
                }
            });
        },

        onPoSelect: function (oEvent) {
            var oSelectedItem = oEvent.getSource();
            var oContext = oSelectedItem.getBindingContext();
            var sPoId = oContext.getProperty("PoId");


            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Poitems", {
                poId: sPoId
            });
        },
        onNavToDashboard: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Dashboard");
        }
    });
});