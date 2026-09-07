sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History"
], function (Controller, UIComponent, Filter, FilterOperator, History) {
    "use strict";

    return Controller.extend("purchaseordertracking.zpomanagementapp.controller.PurchaseOrderItem", {

        onInit: function () {
            
            var oRouter = UIComponent.getRouterFor(this);

            if (oRouter) {
                var oRoute = oRouter.getRoute("Poitems"); 
                if (oRoute) {
                    oRoute.attachPatternMatched(this._onObjectMatched, this);
                } else {
                    console.error("Route 'Poitems' not found in manifest.json");
                }
            } else {
                console.error("Router could not be instantiated.");
            }
        },

        _onObjectMatched: function (oEvent) {
            var sPoId = oEvent.getParameter("arguments").poId;

            if (!sPoId) {
                return;
            }

            
            var oView = this.getView();
            oView.bindElement({
                path: "/POHeaderSet('" + sPoId + "')"
            });

         
            var oItemTable = this.byId("poItemTable");
            if (oItemTable) {
                var oBinding = oItemTable.getBinding("items");
                if (oBinding) {
                    oBinding.filter([
                        new sap.ui.model.Filter("PoId", sap.ui.model.FilterOperator.EQ, sPoId)
                    ]);
                }
            }
        },
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                if (oRouter) {
                    oRouter.navTo("RoutePurchaseOrderHeader", {}, true);
                }
            }
        }
    });
});