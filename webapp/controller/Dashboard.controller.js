sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.Dashboard", {

        onInit: function () {
            // Dashboard KPI and Chart JSON Model
            var oKPIModel = new JSONModel({
                totalCount: 0,
                openCount: 0,
                completedCount: 0,
                totalValue: "0.00",
                statusData: [],
                vendorData: []
            });
            this.getView().setModel(oKPIModel, "kpiModel");

            var oModel = this.getOwnerComponent().getModel();
            if (oModel) {
                oModel.metadataLoaded().then(this._calculateKPIsAndCharts.bind(this));
            }
        },

        _calculateKPIsAndCharts: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oKPIModel = this.getView().getModel("kpiModel");

            oModel.read("/POHeaderSet", {
                success: function (oData) {
                    var aResults = oData.results || [];
                    var iTotalCount = aResults.length;
                    var iOpenCount = 0;
                    var iCompletedCount = 0;
                    var fTotalVal = 0;

                    var mStatusCounts = {};
                    var mVendorSpend = {};

                    aResults.forEach(function (oItem) {
                        // Count Statuses
                        if (oItem.Status === "OPEN") {
                            iOpenCount++;
                        } else if (oItem.Status === "COMPLETED") {
                            iCompletedCount++;
                        }

                        mStatusCounts[oItem.Status] = (mStatusCounts[oItem.Status] || 0) + 1;

                        // Accumulate Amounts
                        var fAmt = parseFloat(oItem.TotalAmount || 0);
                        fTotalVal += fAmt;

                        // Vendor Aggregation
                        if (oItem.VendorId) {
                            mVendorSpend[oItem.VendorId] = (mVendorSpend[oItem.VendorId] || 0) + fAmt;
                        }
                    });

                    // Format Status Data for Donut Chart
                    var aStatusData = Object.keys(mStatusCounts).map(function (sKey) {
                        return { Status: sKey, Count: mStatusCounts[sKey] };
                    });

                    // Format Vendor Data for Column Chart
                    var aVendorData = Object.keys(mVendorSpend).map(function (sKey) {
                        return { VendorId: sKey, Amount: mVendorSpend[sKey] };
                    });

                    oKPIModel.setProperty("/totalCount", iTotalCount);
                    oKPIModel.setProperty("/openCount", iOpenCount);
                    oKPIModel.setProperty("/completedCount", iCompletedCount);
                    oKPIModel.setProperty("/totalValue", fTotalVal.toFixed(2));
                    oKPIModel.setProperty("/statusData", aStatusData);
                    oKPIModel.setProperty("/vendorData", aVendorData);
                },
                error: function () {
                    // Handle OData read error
                }
            });
        },

        onPOCardPress: function (oEvent) {
            var oTile = oEvent.getSource();
            var oContext = oTile.getBindingContext();

            if (!oContext) {
                return;
            }

            var sPoId = oContext.getProperty("PoId");

            // Navigate directly to PurchaseOrderItem view
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("PurchaseOrderItem", {
                PoId: sPoId
            });
        },

        onQuickSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter("PoId", FilterOperator.Contains, sQuery));
            }

            var oBox = this.byId("recentCardsBox");
            var oBinding = oBox.getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onRefreshDashboard: function () {
            this._calculateKPIsAndCharts();
            var oBox = this.byId("recentCardsBox");
            var oBinding = oBox.getBinding("items");
            if (oBinding) {
                oBinding.refresh();
            }
        }
    });
});