import { useState } from "react";
import HistoriLombaIndex from "./Index";
import HistoriLombaAdd from "./Add";
import HistoriLombaReport from "./Report";
import HistoriLombaBimbingan from "./Bimbingan";
import HistoriDetailBimbingan from "./Detail";
export default function HistoriLomba() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <HistoriLombaIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <HistoriLombaAdd onChangePage={handleSetPageMode} />;
      case "report":
        return (
          <HistoriLombaReport
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <HistoriDetailBimbingan
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "addTable":
        return (
          <HistoriLombaBimbingan
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
