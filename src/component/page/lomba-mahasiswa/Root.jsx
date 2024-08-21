import { useState } from "react";
import MahasiswaLombaIndex from "./Index";
import MahasiswaLombaAdd from "./Add";
import MahasiswaLombaDetail from "./Detail";
export default function MahasiswaLomba() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MahasiswaLombaIndex onChangePage={handleSetPageMode} />;
      case "addTable":
        return (
          <MahasiswaLombaAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detail":
        return (
          <MahasiswaLombaDetail
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
