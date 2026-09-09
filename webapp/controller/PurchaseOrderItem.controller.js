sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, UIComponent, Filter, FilterOperator, History, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.PurchaseOrderItem", {

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            if (oRouter) {
                var oRoute = oRouter.getRoute("Poitems");
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onObjectMatched, this);
                }
            }
        },

        _onObjectMatched: function (oEvent) {
            var sPoId = oEvent.getParameter("arguments").poId;
            if (!sPoId) { return; }

            this._sCurrentPoId = sPoId;

            var oView = this.getView();
            oView.bindElement({
                path: "/POHeaderSet('" + sPoId + "')"
            });

            var oItemTable = this.byId("poItemTable");
            if (oItemTable) {
                var oBinding = oItemTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([
                        new Filter("PoId", FilterOperator.EQ, sPoId)
                    ]);
                }
            }
        },

        onCreateItem: function () {
            var oView = this.getView();
            if (!this._oCreateDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "purchaseordertracking.zpomanagementapp.view.fragments.CreateItemDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oCreateDialog = oDialog;
                    oView.addDependent(this._oCreateDialog);
                    this._oCreateDialog.open();
                }.bind(this));
            } else {
                this._oCreateDialog.open();
            }
        },

        onCloseCreateDialog: function () {
            if (this._oCreateDialog) {
                this._oCreateDialog.close();
            }
        },

        onSaveItem: function () {
            var oModel = this.getView().getModel();


            var oItemNoInput = this.byId("inputItemNo");
            var oMaterialInput = this.byId("inputMaterial");
            var oMaterialDescInput = this.byId("inputMaterialDesc");
            var oPlantInput = this.byId("inputPlant");
            var oStorageLocInput = this.byId("inputStorageLoc");
            var oQuantityInput = this.byId("inputQuantity");
            var oUnitInput = this.byId("inputUnit");
            var oNetPriceInput = this.byId("inputNetPrice");
            var oCurrencyInput = this.byId("inputCurrency");
            var oDatePicker = this.byId("inputDeliveryDate");
            var aInputs = [
                oItemNoInput, oMaterialInput, oMaterialDescInput,
                oPlantInput, oStorageLocInput, oQuantityInput,
                oUnitInput, oNetPriceInput, oCurrencyInput
            ];
            aInputs.forEach(function (oInput) {
                if (oInput) {
                    oInput.setValueState("None");
                }
            });

            var sItemNo = oItemNoInput ? oItemNoInput.getValue().trim() : "";
            var sMaterial = oMaterialInput ? oMaterialInput.getValue().trim() : "";
            var sMaterialDesc = oMaterialDescInput ? oMaterialDescInput.getValue().trim() : "";
            var sPlant = oPlantInput ? oPlantInput.getValue().trim() : "";
            var sStorageLoc = oStorageLocInput ? oStorageLocInput.getValue().trim() : "";
            var sQuantityVal = oQuantityInput ? oQuantityInput.getValue().trim() : "";
            var sUnit = oUnitInput ? oUnitInput.getValue().trim() : "";
            var sNetPriceVal = oNetPriceInput ? oNetPriceInput.getValue().trim() : "";
            var sCurrency = oCurrencyInput ? oCurrencyInput.getValue().trim() : "";

            var fQuantity = parseFloat(sQuantityVal);
            var fNetPrice = parseFloat(sNetPriceVal);

            if (!sItemNo) {
                oItemNoInput.setValueState("Error");
                oItemNoInput.setValueStateText("Item Number is required.");
                MessageBox.error("Please enter an Item Number.");
                return;
            } else if (sItemNo.length > 5) {
                oItemNoInput.setValueState("Error");
                oItemNoInput.setValueStateText("Item Number cannot exceed 5 characters.");
                MessageBox.error("Item Number exceeds maximum length (5 characters).");
                return;
            }


            if (!sMaterial) {
                oMaterialInput.setValueState("Error");
                oMaterialInput.setValueStateText("Material is required.");
                MessageBox.error("Please enter a Material Number.");
                return;
            } else if (sMaterial.length > 40) {
                oMaterialInput.setValueState("Error");
                oMaterialInput.setValueStateText("Material cannot exceed 40 characters.");
                MessageBox.error("Material Number exceeds maximum length (40 characters).");
                return;
            }


            if (sMaterialDesc.length > 40) {
                oMaterialDescInput.setValueState("Error");
                oMaterialDescInput.setValueStateText("Description cannot exceed 40 characters.");
                MessageBox.error("Material Description exceeds maximum length (40 characters).");
                return;
            }


            if (!sPlant) {
                oPlantInput.setValueState("Error");
                oPlantInput.setValueStateText("Plant is required.");
                MessageBox.error("Please enter a Plant.");
                return;
            } else if (sPlant.length !== 4) {
                oPlantInput.setValueState("Error");
                oPlantInput.setValueStateText("Plant must be exactly 4 characters.");
                MessageBox.error("Plant code must be exactly 4 characters long.");
                return;
            }


            if (sStorageLoc && sStorageLoc.length > 4) {
                oStorageLocInput.setValueState("Error");
                oStorageLocInput.setValueStateText("Storage Location cannot exceed 4 characters.");
                MessageBox.error("Storage Location exceeds maximum length (4 characters).");
                return;
            }


            if (!sQuantityVal || isNaN(fQuantity) || fQuantity <= 0) {
                oQuantityInput.setValueState("Error");
                oQuantityInput.setValueStateText("Quantity must be a positive number.");
                MessageBox.error("Please enter a valid Quantity greater than 0.");
                return;
            }


            if (!sUnit) {
                oUnitInput.setValueState("Error");
                oUnitInput.setValueStateText("Unit of Measure is required.");
                MessageBox.error("Please enter a Unit of Measure.");
                return;
            } else if (sUnit.length > 3) {
                oUnitInput.setValueState("Error");
                oUnitInput.setValueStateText("Unit cannot exceed 3 characters.");
                MessageBox.error("Unit of Measure exceeds maximum length (3 characters).");
                return;
            }


            if (!sNetPriceVal || isNaN(fNetPrice) || fNetPrice < 0) {
                oNetPriceInput.setValueState("Error");
                oNetPriceInput.setValueStateText("Net Price must be a non-negative number.");
                MessageBox.error("Please enter a valid Net Price (0 or greater).");
                return;
            }


            if (!sCurrency) {
                oCurrencyInput.setValueState("Error");
                oCurrencyInput.setValueStateText("Currency is required.");
                MessageBox.error("Please enter a Currency code.");
                return;
            } else if (sCurrency.length !== 3) {
                oCurrencyInput.setValueState("Error");
                oCurrencyInput.setValueStateText("Currency code must be exactly 3 characters.");
                MessageBox.error("Currency code must be exactly 3 characters (e.g., USD, EUR).");
                return;
            }

            var oDateValue = oDatePicker ? oDatePicker.getDateValue() : null;
            if (oDateValue) {
                oDateValue = new Date(Date.UTC(
                    oDateValue.getFullYear(),
                    oDateValue.getMonth(),
                    oDateValue.getDate()
                ));
            }

            var oPayload = {
                PoId: this._sCurrentPoId,
                ItemNo: sItemNo,
                Material: sMaterial,
                MaterialDesc: sMaterialDesc,
                Plant: sPlant,
                StorageLoc: sStorageLoc,
                Quantity: fQuantity.toString(),
                Unit: sUnit,
                NetPrice: fNetPrice.toString(),
                Currency: sCurrency,
                DeliveryDate: oDateValue
            };

            oModel.create("/POItemSet", oPayload, {
                success: function () {
                    MessageBox.success("Item created successfully!");
                    this.onCloseCreateDialog();
                    this.getView().getElementBinding().refresh();
                    this.byId("poItemTable").getBinding("items").refresh();
                }.bind(this),
                error: function (oError) {
                    MessageBox.error("Error creating item. Check backend logs.");
                }
            });
        },
        onEditPoItem: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (!oContext) {
                MessageBox.error("Unable to select item context.");
                return;
            }

            this._sEditItemPath = oContext.getPath();
            var oView = this.getView();

            if (!this._oEditItemDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "purchaseordertracking.zpomanagementapp.view.fragments.EditPoItemDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._oEditItemDialog = oDialog;
                    oView.addDependent(this._oEditItemDialog);
                    this._oEditItemDialog.bindElement(this._sEditItemPath);
                    this._oEditItemDialog.open();
                }.bind(this));
            } else {
                this._oEditItemDialog.bindElement(this._sEditItemPath);
                this._oEditItemDialog.open();
            }
        },

        onCloseEditItemDialog: function () {
            if (this._oEditItemDialog) {
                this._oEditItemDialog.close();
            }
        },

        onSaveEditPoItem: function () {
            var oModel = this.getView().getModel();
            var oTable = this.byId("poItemsTable"); // Reference table instance safely here

            var oDatePicker = this.byId("editDeliveryDate");
            var oDateValue = oDatePicker ? oDatePicker.getDateValue() : null;
            if (oDateValue) {
                oDateValue = new Date(Date.UTC(
                    oDateValue.getFullYear(),
                    oDateValue.getMonth(),
                    oDateValue.getDate()
                ));
            }

            var oPayload = {
                Material: this.byId("editMaterial").getValue().trim(),
                MaterialDesc: this.byId("editMaterialDesc").getValue().trim(),
                Plant: this.byId("editPlant").getValue().trim(),
                StorageLoc: this.byId("editStorageLoc").getValue().trim(),
                Quantity: this.byId("editQuantity").getValue().trim(),
                Unit: this.byId("editUnit").getValue().trim(),
                NetPrice: this.byId("editNetPrice").getValue().trim(),
                Currency: this.byId("editCurrency").getValue().trim(),
                DeliveryDate: oDateValue
            };

            oModel.update(this._sEditItemPath, oPayload, {
                success: function () {
                    MessageToast.show("Line item updated successfully!");

                    // Close the dialog safely
                    this.onCloseEditItemDialog();

                    // Refresh table items binding safely using external reference or bound context
                    if (oTable && oTable.getBinding("items")) {
                        oTable.getBinding("items").refresh();
                    }
                }.bind(this), // <--- .bind(this) ensures 'this' refers to the Controller inside callback

                error: function (oError) {
                    MessageBox.error("Failed to update line item.");
                }
            });
        },
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                if (oRouter) {
                    oRouter.navTo("PurchaseOrderHeader", {}, true);
                }
            }
        }
    });
});