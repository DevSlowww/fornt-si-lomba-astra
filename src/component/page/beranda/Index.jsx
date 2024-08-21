import React from "react";
import Cookies from "js-cookie";
import { Tab, Tabs } from "react-bootstrap";
import DashboardHimma from "../beranda/DashboardHimma";
import DashboardAdmin from "../beranda/DashboardAdmin";
import DashboardProdi from "../beranda/DashboardProdi";
import DashboardDosenPembimbing from "../beranda/DashboardDosenPembimbing";
import DashboardMahasiswa from "../beranda/DashboardMahasiswa";
import SelamatDatang from "../../part/SelamatDatang";
import { decryptId } from "../../util/Encryptor";

const cookie = Cookies.get("activeUser");
const userInfo = cookie ? JSON.parse(decryptId(cookie)) : {};

export default function BerandaIndex() {
  const renderDashboard = () => {
    switch (userInfo.role) {
      case "ROL53":
        return <DashboardHimma />;
      case "ROL23":
        return <DashboardMahasiswa />;
      case "ROL54":
        return <DashboardDosenPembimbing />;
      case "ROL22":
        return <DashboardProdi />;
      case "ROL52":
        return <DashboardAdmin />;
      default:
        return <div>Role tidak dikenali</div>;
    }
  };

  return (
    <>
      <Tabs
        defaultActiveKey="beranda"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="beranda" title="Beranda">
          <SelamatDatang />
        </Tab>
        <Tab eventKey="dashboard" title="Dashboard">
          {renderDashboard()}
        </Tab>
      </Tabs>
    </>
  );
}
