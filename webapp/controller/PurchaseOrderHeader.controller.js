sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
], function (Controller, Filter, FilterOperator, MessageToast, Fragment, MessageBox, Spreadsheet) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.PurchaseOrderHeader", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            var oRoute = oRouter.getRoute("Dashboard");

            if (oRoute) {
                oRoute.attachPatternMatched(this._onRouteMatched, this);
            }
        },

        _onRouteMatched: function (oEvent) {
            this.refreshDashboardData();
        },

        refreshDashboardData: function () {
            var oView = this.getView();

            var oModel = oView.getModel();

            if (!oModel) {
                console.warn("No model found on view.");
                return;
            }

            if (typeof oModel.refresh === "function") {

                oModel.refresh(true, true);
            }


            var aControls = oView.findAggregatedObjects(true);
            aControls.forEach(function (oControl) {
                if (typeof oControl.getBinding === "function") {
                    var oBinding = oControl.getBinding("items") ||
                        oControl.getBinding("rows") ||
                        oControl.getBinding("value");
                    if (oBinding && typeof oBinding.refresh === "function") {
                        oBinding.refresh(true);
                    }
                }
            });

            MessageToast.show("Dashboard data updated.");
        },

        onSearch: function () {
            var aFilters = [];


            var sPoId = this.byId("filterPoId").getValue().trim();
            var sVendor = this.byId("filterVendor").getValue().trim();
            var sStatus = this.byId("filterStatus").getSelectedKey();


            if (sPoId) {
                aFilters.push(new Filter("PoId", FilterOperator.Contains, sPoId));
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
        onEditPo: function (oEvent) {
            var oMenuItem = oEvent.getSource();
            var oContext = oMenuItem.getBindingContext();
            if (!oContext) {
                MessageBox.error("Unable to locate item context.");
                return;
            }
            this._sEditPath = oContext.getPath();
            var oView = this.getView();
            if (!this._oEditPoDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "purchaseordertracking.zpomanagementapp.view.fragments.EditPoDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oEditPoDialog = oDialog;
                    oView.addDependent(this._oEditPoDialog);
                    this._oEditPoDialog.bindElement(this._sEditPath);
                    this._oEditPoDialog.open();
                }.bind(this));
            } else {
                this._oEditPoDialog.bindElement(this._sEditPath);
                this._oEditPoDialog.open();
            }
        },


        onCloseEditPoDialog: function () {
            if (this._oEditPoDialog) {
                this._oEditPoDialog.close();
            }
        },

        onSaveEditPo: function () {
            var oModel = this.getView().getModel();

            var oVendorInput = this.byId("editVendorId");
            var sVendorId = oVendorInput ? oVendorInput.getValue().trim() : "";
            var sCompanyCode = this.byId("editCompanyCode").getValue().trim();
            var sPurOrg = this.byId("editPurOrg").getValue().trim();
            var sPurGroup = this.byId("editPurGroup").getValue().trim();
            var sStatus = this.byId("editStatus").getSelectedKey();
            var sCurrency = this.byId("editCurrency") ? this.byId("editCurrency").getValue().trim() : "";
            if (!sVendorId) {
                oVendorInput.setValueState("Error");
                oVendorInput.setValueStateText("Vendor ID is required.");
                MessageBox.error("Please enter a Vendor ID.");
                return;
            } else {
                oVendorInput.setValueState("None");
            }

            var oPayload = {
                VendorId: sVendorId,
                CompanyCode: sCompanyCode,
                PurOrg: sPurOrg,
                PurGroup: sPurGroup,
                Status: sStatus,
                Currency: sCurrency
            };

            oModel.update(this._sEditPath, oPayload, {
                success: function () {
                    MessageToast.show("Purchase Order updated successfully!");
                    this.onCloseEditPoDialog();
                    this.byId("managePoTable").getBinding("items").refresh();
                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Failed to update Purchase Order. Check backend logs.");
                }
            });
        },

        onViewItems: function (oEvent) {
            var oMenuItem = oEvent.getSource();
            var oContext = oMenuItem.getBindingContext();
            var sPoId = oContext.getProperty("PoId");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Poitems", {
                poId: sPoId
            });
        },

        onDeleteSelected: function () {
            var oTable = this.byId("managePoTable");
            var aSelectedItems = oTable.getSelectedItems();
            var oModel = this.getView().getModel();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Please select at least one Purchase Order to delete.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete the selected Purchase Order(s)?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var iTotal = aSelectedItems.length;
                        var iSuccessCount = 0;
                        var iErrorCount = 0;
                        aSelectedItems.forEach(function (oItem) {
                            var sPath = oItem.getBindingContext().getPath();

                            oModel.remove(sPath, {
                                success: function () {
                                    iSuccessCount++;
                                    this._checkDeleteCompletion(iSuccessCount, iErrorCount, iTotal, oTable, oModel);
                                }.bind(this),
                                error: function () {
                                    iErrorCount++;
                                    this._checkDeleteCompletion(iSuccessCount, iErrorCount, iTotal, oTable, oModel);
                                }.bind(this)
                            });
                        }.bind(this));
                    }
                }.bind(this)
            });
        },

        _checkDeleteCompletion: function (iSuccess, iError, iTotal, oTable, oModel) {
            if (iSuccess + iError === iTotal) {
                if (iError === 0) {
                    MessageToast.show(iSuccess + " Purchase Order(s) deleted successfully.");
                } else {
                    MessageBox.error(iError + " out of " + iTotal + " items failed to delete.");
                }


                oTable.removeSelections(true);
                oModel.refresh(true);
            }
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
        _createColumnConfig: function () {
            return [
                {
                    label: "PO Number",
                    property: "PoId",
                    type: "string"
                },
                {
                    label: "Vendor ID",
                    property: "VendorId",
                    type: "string"
                },
                 {
                    label: "Purchasing Org",
                    property: "PurOrg",
                    type: "string"
                },
                 {
                    label: "Purchasing Date",
                    property: "PoDate",
                    type: "date"
                },
                {
                    label: "Purchasing Group",
                    property: "PurGroup",
                    type: "string"
                },
                {
                    label: "Total Amount",
                    property: "TotalAmount",
                    type: "number",
                    scale: 2
                },
                {
                    label: "Currency",
                    property: "Currency",
                    type: "string"
                },
                {
                    label: "Status",
                    property: "Status",
                    type: "string"
                }
            ];
        },

        onExportExcel: function () {
            var oTable = this.byId("managePoTable");
            if (!oTable) {
                MessageBox.error("Table not found.");
                return;
            }

            var oBinding = oTable.getBinding("items");
            if (!oBinding) {
                MessageBox.error("No binding found for export.");
                return;
            }

            var oModel = oBinding.getModel();
            var aCols = this._createColumnConfig();

            var oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: {
                    type: "odata",
                    dataUrl: oBinding.getDownloadUrl ? oBinding.getDownloadUrl() : null,
                    serviceUrl: oModel.sServiceUrl,
                    headers: oModel.getHeaders ? oModel.getHeaders() : {},
                    query: oBinding.sFilterParams,
                    count: oBinding.getLength()
                },
                fileName: "Purchase_Orders_Export.xlsx",
                worker: false
            };

            var oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show("Excel export successful.");
                })
                .catch(function (oError) {
                    MessageBox.error("Excel export failed: " + oError);
                })
                .finally(function () {
                    oSheet.destroy();
                });
        },
        onNavToDashboard: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Dashboard");
        }
    });
});