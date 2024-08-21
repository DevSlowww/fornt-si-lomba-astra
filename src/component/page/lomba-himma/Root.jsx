import { useState } from "react";
import MasterLombaIndex from "./Index";
import MasterLombaAdd from "./Add";
import MasterLombaDetail from "./Detail";
import MasterLombaEdit from "./Edit";

export default function MasterLomba() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterLombaIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <MasterLombaAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterLombaDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterLombaEdit
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
