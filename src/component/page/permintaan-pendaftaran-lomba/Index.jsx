import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import { formatDate } from "../../util/Formatting";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import SweetAlert from "../../util/SweetAlert";
import Swal from "sweetalert2";
import Modal from "../../part/Modal";
import Select2 from "../../part/Select2";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Mahasiswa": null,
    "Nama Lomba": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Mahasiswa] asc", Text: "Nama Mahasiwa [↑]" },
  { Value: "[Nama Mahasiswa] desc", Text: "Nama Mahasiswa [↓]" },
  { Value: "[Nama Lomba] asc", Text: "Nama Lomba [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama Lomba [↓]" },
];

const dataFilterStatus = [
  { Value: "Disetujui", Text: "Disetujui" },
  { Value: "Tidak Disetujui", Text: "Tidak Disetujui" },
  { Value: "Menunggu Persetujuan", Text: "Menunggu Persetujuan" },
];

export default function PermintaanPendaftaranIndex({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const role = JSON.parse(decryptId(Cookies.get("activeUser"))).role;
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [pendaftaranLomba, setPendaftaranLomba] = useState();
  const [pembimbing, setPembimbing] = useState();
  const [selectedPembimbing, setSelectedPembimbing] = useState("");

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Lomba] asc",
    status: "Menunggu Persetujuan",
  });

  const formDataRef = useRef({
    lmb_id: "",
    pmb_id: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const searchFilterDokumentasiPendaftaran = useRef();
  const searchFilterSertifikatPendaftaran = useRef();
  const modalRef = useRef();

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current.pmb_id = value;
    setSelectedPembimbing(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "TrPendaftaran/GetDataPendaftaran",
          currentFilter
        );
        const dataPembimbing = await UseFetch(
          API_LINK + "Utilities/GetListPembimbing",
          {}
        );
        if (data === "ERROR" || dataPembimbing === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map(({ Statusnya, Pmb, ...rest }) => {
            const aksi =
              Statusnya === "Disetujui"
                ? []
                : Statusnya === "Tidak Disetujui"
                ? []
                : ["Approve", "Reject"];

            const formattedItem = {
              ...rest,
              Alignment: [
                "center",
                "center",
                "center",
                "center",
                "center",
                "center",
              ],
            };

            if (aksi.length > 0) {
              formattedItem.Aksi = aksi;
            }

            return formattedItem;
          });

          setCurrentData(formattedData);

          const Pbg = data.map(({ Hasil, Pmb, ...rest }) => ({
            idkey: rest.Key,
            pbg_id: Pmb,
          }));
          setPembimbing(Pbg);
          setCurrentData(formattedData);
          setPendaftaranLomba(dataPembimbing);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: 1,
        query: searchQuery.current.value,
        sort: searchFilterSort.current.value,
        status: searchFilterStatus.current.value,
      };
    });
  }

  const handleSetPembimbing = () => {};

  const handleSetStatus = (id) => {
    Swal.fire({
      title: "Setujui Pendaftaran?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, setujui!",
      cancelButtonText: "Tidak, batal!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        formDataRef.current.lmb_id = id;
        setIsLoading(true);
        setIsError(false);
        const currentItem = pembimbing.find((item) => item.idkey === id);
        formDataRef.current.pmb_id = currentItem.pbg_id;
        setSelectedPembimbing(currentItem.pbg_id);
        modalRef.current.open();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Dibatalkan", "Perubahan status dibatalkan", "error");
      }
    });
  };

  const handleConfirmSetStatus = () => {
    UseFetch(API_LINK + "TrPendaftaran/SetStatusPendaftaran", {
      idBimbingan: formDataRef.current.lmb_id,
      pembimbing: formDataRef.current.pmb_id,
      status: "Disetujui",
    }).then((data) => {
      if (data === "ERROR" || data.length === 0) {
        setIsError(true);
      } else {
        modalRef.current.close();
        Swal.fire(
          "Berhasil!",
          "Status data pendaftaran berhasil diubah menjadi Disetujui" + data[0].Hasil,
          "success"
        );
        handleSetCurrentPage(currentFilter.page);
      }
    });
  };

  const handleSetStatusApprove = (id) => {
    Swal.fire({
      title: "Tidak setujui pendaftaran?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, tidak setujui!",
      cancelButtonText: "Tidak, batal!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        setIsError(false);

        UseFetch(API_LINK + "TrPendaftaran/SetStatusPendaftaran", {
          idBimbingan: id,
          pembimbing: "",
          status: "Tidak Disetujui",
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else {
              Swal.fire(
                "Berhasil!",
                "Status data pendaftaran berhasil diubah menjadi Tidak Setujui" +
                  data[0].Hasil,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .catch(() => setIsError(true))
          .finally(() => setIsLoading(false));
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire("Dibatalkan", "Perubahan status dibatalkan", "error");
      }
    });
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <Modal
            title="Pilih Peran"
            ref={modalRef}
            size="small"
            Button1={
              <Button
                classType="primary mx-2 px-4"
                label="SIMPAN"
                onClick={handleConfirmSetStatus}
              />
            }
          >
            <div className="list-group" style={{ height: 200 }}>
              <Select2
                forInput="pmb_id"
                label="Pembimbing Lomba"
                arrData={pendaftaranLomba}
                isRequired
                value={selectedPembimbing}
                onChange={handleInputChange}
                errorMessage={errors.pmb_id}
              />
            </div>
          </Modal>
        </div>
      </div>

      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Pendaftaran Lomba."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Input
              ref={searchQuery}
              forInput="pencarianPendaftaranLomba"
              placeholder="Cari"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
            <Filter>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Tanggal Buat] desc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="Menunggu Persetujuan"
              />
            </Filter>
          </div>
        </div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
              <Table
                data={currentData}
                onApprove={handleSetStatus}
                onReject={handleSetStatusApprove}
              />
              <Paging
                pageSize={PAGE_SIZE}
                pageCurrent={currentFilter.page}
                totalData={currentData[0]["Count"]}
                navigation={handleSetCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
