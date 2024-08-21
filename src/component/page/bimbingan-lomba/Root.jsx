import { useState } from "react";
import BimbinganLombaIndex from "./Index";
import BimbinganLombaAdd from "./Add";
export default function HistoriLomba() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <BimbinganLombaIndex onChangePage={handleSetPageMode} />;
      case "addTable":
        return (
          <BimbinganLombaAdd onChangePage={handleSetPageMode} withID={dataID} />
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
