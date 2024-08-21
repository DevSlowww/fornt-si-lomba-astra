import { useState } from "react";
import LombaProdiIndex from "./Index";
// import MasterLombaAdd from "./Add";
import LombaProdiDetail from "./Detail";
// import MasterLombaEdit from "./Edit";

export default function LombaProdi() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <LombaProdiIndex onChangePage={handleSetPageMode} />;
      // case "add":
      //   return <LombaProdiAdd onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <LombaProdiDetail
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      // case "edit":
      //   return (
      //     <LombaProdiEdit
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
