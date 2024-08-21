import { useState } from "react";
import MasterProdukIndex from "./Index";
import MasterProdukAdd from "./Add";
import MasterProdukDetail from "./Detail";
import MasterProdukEdit from "./Edit";
import ErrorBoundary from "../../part/ErrorBoundary"; // Pastikan Anda sudah membuat ErrorBoundary

export default function MasterProduk() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterProdukIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterProdukAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterProdukDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterProdukEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      default:
        return <MasterProdukIndex onChangePage={handleSetPageMode} />;
    }
  }

  function handleSetPageMode(mode, withID = null) {
    setDataID(withID);
    setPageMode(mode);
  }

  return (
    <ErrorBoundary>
      <div>{getPageMode()}</div>
    </ErrorBoundary>
  );
}
