import { lazy } from "react";
import LombaMahasiswa from "../page/lomba-mahasiswa/Root";
import ReportLombaIndex from "../page/report-hasil-lomba/Index";
import HistoriLombaIndex from "../page/histori-lomba/Index";

const Beranda = lazy(() => import("../page/beranda/Root"));
const MasterLomba = lazy(() => import("../page/master-lomba/Root"));
const MasterTopik = lazy(() => import("../page/master-topik/Root"));
const PermintaanPendaftaranLomba = lazy(() =>
  import("../page/permintaan-pendaftaran-lomba/Root")
);
const BimbinganLomba = lazy(() => import("../page/bimbingan-lomba/Root"));
const LombaBimbingan = lazy(() => import("../page/lomba-bimbingan/Root"));
const LombaProdi = lazy(() => import("../page/lomba-prodi/Root"));
const HimmaLomba = lazy(() => import("../page/lomba-himma/Root"));
const HistoriLomba = lazy(() => import("../page/histori-lomba/Root"));

// const LombaMahasiswa = lazy(() => import("../page/lomba-mahasiswa/Root"));

const routeList = [
  {
    path: "/",
    element: <Beranda />,
  },
  {
    path: "/master_topik",
    element: <MasterTopik />,
  },
  {
    path: "/master_lomba",
    element: <MasterLomba />,
  },
  {
    path: "/pendaftaran_lomba",
    element: <PermintaanPendaftaranLomba />,
  },
  {
    path: "/bimbingan_lomba",
    element: <BimbinganLomba />,
  },
  {
    path: "/lomba_prodi",
    element: <LombaProdi />,
  },
  {
    path: "/lomba_mahasiswa",
    element: <LombaMahasiswa />,
  },
  {
    path: "/lomba_bimbingan",
    element: <LombaBimbingan />,
  },
  {
    path: "/lomba_himma",
    element: <HimmaLomba />,
  },
  {
    path: "/histori_lomba",
    element: <ReportLombaIndex />,
  },
  {
    path: "/riwayat_lomba",
    element: <HistoriLomba />,
  },
];

export default routeList;
