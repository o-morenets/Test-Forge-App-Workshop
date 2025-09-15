import React from "react";
import ForgeReconciler, {
  useProductContext,
} from "@forge/react";

import {jsmModuleKey} from "./constants";
import {AdminModule} from "./components/AdminModule";

const App = () => {
  const context = useProductContext();
  const moduleKey = context?.moduleKey;

  const renderUI = () => {
    switch (moduleKey) {
      case jsmModuleKey.AdminPage:
        return <AdminModule/>
      default:
        return <AdminModule/>
    }
  }

  return renderUI()
};

ForgeReconciler.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
