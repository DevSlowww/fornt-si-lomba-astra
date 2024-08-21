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
const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Mahasiswa": null,
    "Nama Lomba": null,
    Tanggal: null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Mahasiswa] asc", Text: "Nama Mahasiswa [↑]" },
  { Value: "[Nama Mahasiswa] desc", Text: "Nama Mahasiswa [↓]" },
  { Value: "[Nama Lomba] asc", Text: "Nama Lomba [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama Lomba [↓]" },
];

const dataFilterStatus = [
  { Value: "Disetujui", Text: "Disetujui" },
  { Value: "Ditolak", Text: "Ditolak" },
  { Value: "Belum Disetujui", Text: "Belum Disetujui" },
  { Value: "Selesai ", Text: "Selesai  " },
];

export default function BimbinganLombaIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Mahasiswa] asc",
    status: "Disetujui",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();
  const searchFilterTopikBimbingan = useRef();
  const searchFilterCatatanBimbingan = useRef();

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      status: searchFilterStatus.current.value,
    }));
  }
  const handleSetStatusApprove = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda benar-benar ingin mengubah status menjadi Disetujui?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, ubah!",
      cancelButtonText: "Tidak, batal!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(id);
        setIsLoading(true);
        setIsError(false);

        UseFetch(API_LINK + "Bimbingan/SetStatusBimbingan", {
          idBimbingan: id,
          statusBimbingan: "Disetujui",
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else {
              Swal.fire(
                "Berhasil!",
                `Status data bimbingan berhasil diubah menjadi ${data[0].Status}`,
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
  const handleSetStatusReject = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Apakah Anda benar-benar ingin mengubah status menjadi Ditolak?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, ubah!",
      cancelButtonText: "Tidak, batal!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(id);
        setIsLoading(true);
        setIsError(false);

        UseFetch(API_LINK + "Bimbingan/SetStatusBimbingan", {
          idBimbingan: id,
          statusBimbingan: "Ditolak",
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) {
              setIsError(true);
            } else {
              Swal.fire(
                "Berhasil!",
                `Status data bimbingan berhasil diubah menjadi ${data[0].Status}`,
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

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Bimbingan/GetDataBimbingan",
          currentFilter
        );

        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => {
            const aksi =
              value.Status === "Belum Disetujui"
                ? ["Approve", "Reject"]
                : value.Status === "Disetujui"
                ? ["Add"]
                : [];

            const formattedItem = {
              ...value,
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
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data Bimbingan Lomba."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            {/* <Button
              iconName="add"
              classType="success"
              label="Tambah"
              onClick={() => onChangePage("add")}
            /> */}
            <Input
              ref={searchQuery}
              forInput="pencarianBimbingan"
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
                defaultValue="[Nama Mahasiswa] asc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="Disetujui"
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
                onApprove={handleSetStatusApprove}
                onReject={handleSetStatusReject}
                onAdd={onChangePage}
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
