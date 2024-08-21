import { useState } from "react";
import LombaDospemIndex from "./Index";
// import MasterLombaAdd from "./Add";
import LombaDospemDetail from "./Detail";
// import MasterLombaEdit from "./Edit";

export default function LombaDospem() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <LombaDospemIndex onChangePage={handleSetPageMode} />;
      // case "add":
      //   return <LombaDospemAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <LombaDospemDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      // case "edit":
      //   return (
      //     <LombaDospemEdit
      //       onChangePage={handleSetPageMode}
      //       withID={dataID}
      //     />
      //   );
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
