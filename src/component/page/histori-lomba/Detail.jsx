import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Label from "../../part/Label";
import { FILE_LINK } from "../../util/Constants";
const inisialisasiData = [
  {
    Key: null,
    "Tanggal Bimbingan": null,
    Topik: null,
    Catatan: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Lomba] asc", Text: "Nama [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama [↓]" },
];

const dataFilterStatus = [
  { Value: "Disetujui", Text: "Disetujui" },
  { Value: "Tidak Disetujui", Text: "Tidak Disetujui" },
  { Value: "Menunggu Persetujuan", Text: "Menunggu Persetujuan" },
];

export default function HistoriDetailBimbingan({ onChangePage, withID }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentDataPdft, setCurrentDataPdft] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: withID,
  });
  const formDataRef = useRef({
    Key: "",
    NamaMahasiswa: "",
    NamaLomba: "",
    NamaPembimbing: "",
    TanggalPendaftaran: "",
    HasilPendaftaran: "",
    TanggalSelesai: "",
    DokumentasiPendaftaran: "",
    SertifikatPendaftaran: "",
    Status: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Bimbingan/GetDataHistoriBimbingan",
          currentFilter
        );
        const dataPdft = await UseFetch(
          API_LINK + "TrPendaftaran/DetailPendaftaran",
          {
            id: withID,
          }
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0 && dataPdft.length > 0) {
          setCurrentData(inisialisasiData);
          formDataRef.current = { ...formDataRef.current, ...dataPdft[0] };
        } else {
          formDataRef.current = { ...formDataRef.current, ...dataPdft[0] };
          const formattedData = data.map(({ Tanggal, Hasil, ...rest }) => ({
            ...rest,
            Alignment: [
              "center",
              "center",
              "center",
              "center",
              "center",
              "center",
            ],
          }));

          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day); // Bulan diubah ke indeks berbasis nol
  };

  const isTanggalSelesaiValid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Mengatur jam, menit, detik, dan milidetik menjadi 0 untuk hanya membandingkan tanggal
    const tanggalSelesaiString = formDataRef.current.TanggalSelesai;
    const tanggalSelesai = parseDate(tanggalSelesaiString);
    console.log(tanggalSelesaiString, tanggalSelesai);
    return tanggalSelesai >= today;
  };

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data produk."
            />
          </div>
        )}
        {!isTanggalSelesaiValid() &&
          formDataRef.current.HasilPendaftaran == "-" && (
            <div className="flex-fill">
              <Alert
                type="warning"
                message={
                  <>
                    Anda perlu submit hasil lomba{" "}
                    <a href="#" onClick={() => onChangePage("report", withID)}>
                      klik disini
                    </a>
                    .
                  </>
                }
              />
            </div>
          )}
        <div className="flex-fill">
          <div className="card">
            <div className="card-header bg-primary fw-medium text-white">
              Detail Data Lomba
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-lg-3">
                  <Label
                    forLabel="NamaMahasiswa"
                    title="Nama Mahasiswa"
                    data={formDataRef.current.NamaMahasiswa}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="NamaLomba"
                    title="Nama Lomba"
                    data={formDataRef.current.NamaLomba}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="NamaPembimbing"
                    title="Nama Pembimbing"
                    data={formDataRef.current.NamaPembimbing}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="TanggalPendaftaran"
                    title="Tanggal Pendaftaran"
                    data={formDataRef.current.TanggalPendaftaran}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="HasilPendaftaran"
                    title="Hasil Pendaftaran"
                    data={formDataRef.current.HasilPendaftaran}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="DokumentasiPendaftaran"
                    title="Dokumentasi Pendaftaran"
                    data={
                      formDataRef.current.DokumentasiPendaftaran.replace(
                        "-",
                        ""
                      ) === "" ? (
                        "-"
                      ) : (
                        <a
                          href={
                            FILE_LINK +
                            formDataRef.current.DokumentasiPendaftaran
                          }
                          className="text-decoration-none"
                          target="_blank"
                        >
                          Tampilkan gambar
                        </a>
                      )
                    }
                    href={formDataRef.current.DokumentasiPendaftaran}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="SertifikatPendaftaran"
                    title="Sertifikat Pendaftaran"
                    data={
                      formDataRef.current.SertifikatPendaftaran.replace(
                        "-",
                        ""
                      ) === "" ? (
                        "-"
                      ) : (
                        <a
                          href={
                            FILE_LINK +
                            formDataRef.current.SertifikatPendaftaran
                          }
                          className="text-decoration-none"
                          target="_blank"
                        >
                          Tampilkan file
                        </a>
                      )
                    }
                    href={formDataRef.current.SertifikatPendaftaran}
                  />
                </div>
                <div className="col-lg-3">
                  <Label
                    forLabel="Status"
                    title="Status Pendaftaran"
                    data={formDataRef.current.Status}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card my-4">
            <div className="card-header bg-primary fw-medium text-white">
              Detail Data Bimbingan
            </div>
            <div className="card-body p-4">
              <div className="input-group">
                {isTanggalSelesaiValid() && (
                  <Button
                    iconName="add"
                    classType="success"
                    label="Tambah"
                    onClick={() => onChangePage("addTable", withID)}
                  />
                )}
              </div>
              <div className="row my-2">
                <Table data={currentData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
