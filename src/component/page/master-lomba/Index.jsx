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

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "Nama Lomba": null,
    "Nama Topik": null,
    Status: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Nama Lomba] asc", Text: "Nama Lomba [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama Lomba [↓]" },
  { Value: "[Nama Topik] asc", Text: "Topik Lomba [↑]" },
  { Value: "[Nama Topik] desc", Text: "Topik Lomba [↓]" },
  { Value: "[Penyelenggara] asc", Text: "Penyelenggara Lomba [↑]" },
  { Value: "[Penyelenggara] desc", Text: "Penyelenggara Lomba [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterLombaIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Lomba] asc",
    status: "Aktif",
    nama_topik: "",
    penyelenggara: "",
  });

  const searchQueryRef = useRef(null);
  const searchFilterSortRef = useRef(null);
  const searchFilterStatusRef = useRef(null);
  const searchFilterNamaTopikRef = useRef(null);
  const searchFilterPenyelenggaraRef = useRef(null);

  const handleSetCurrentPage = (newCurrentPage) => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  };

  const handleSearch = () => {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQueryRef.current?.value || "",
      sort: searchFilterSortRef.current?.value || "[Nama Lomba] asc",
      status: searchFilterStatusRef.current?.value || "Aktif",
      nama_topik: searchFilterNamaTopikRef.current?.value || "",
      penyelenggara: searchFilterPenyelenggaraRef.current?.value || "",
    }));
  };

  // const handleSetStatus = (id) => {
  //   setIsLoading(true);
  //   setIsError(false);
  //   UseFetch(API_LINK + "MasterLomba/SetStatusLomba", { idLomba: id })
  //     .then((data) => {
  //       if (data === "ERROR" || data.length === 0) setIsError(true);
  //       else {
  //         SweetAlert(
  //           "Sukses",
  //           "Status data lomba berhasil diubah menjadi " + data[0].Status,
  //           "success"
  //         );
  //         handleSetCurrentPage(currentFilter.page);
  //       }
  //     })
  //     .catch(() => setIsError(true))
  //     .finally(() => setIsLoading(false));
  // };

  // Pastikan Anda menangani kesalahan saat melakukan set status
  const handleSetStatus = (id) => {
    setIsLoading(true);
    setIsError(false);
    UseFetch(API_LINK + "MasterLomba/SetStatusLomba", { idLomba: id })
      .then((data) => {
        if (data === "ERROR" || data.length === 0) {
          setIsError(true);
        } else {
          SweetAlert(
            "Sukses",
            "Status data lomba berhasil diubah menjadi " + data[0].Status,
            "success"
          );
          handleSetCurrentPage(currentFilter.page);
        }
      })
      .catch((error) => {
        // Tangani kesalahan di sini
        console.error("Error setting status:", error);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  };

  // Dalam useEffect, pastikan Anda menggunakan try-catch untuk menangani kesalahan fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const fetchedData = await UseFetch(
          API_LINK + "MasterLomba/GetDataLomba",
          currentFilter
        );

        if (fetchedData === "ERROR") {
          setIsError(true);
        } else if (fetchedData.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = fetchedData.map((value) => ({
            ...value,
            Aksi: ["Toggle", "Detail", "Edit"],
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
      } catch (error) {
        // Tangani kesalahan fetch di sini
        console.error("Error fetching data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <div className="d-flex flex-column">
      {isError && (
        <div className="flex-fill">
          <Alert
            type="warning"
            message="Terjadi kesalahan: Gagal mengambil data lomba."
          />
        </div>
      )}
      <div className="flex-fill">
        <div className="input-group">
          <Button
            iconName="add"
            classType="success"
            label="Tambah"
            onClick={() => onChangePage("add")}
          />
          <Input
            ref={searchQueryRef}
            forInput="pencarianLomba"
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
              ref={searchFilterSortRef}
              forInput="ddUrut"
              label="Urut Berdasarkan"
              type="none"
              arrData={dataFilterSort}
              defaultValue="[Nama Lomba] asc"
            />
            <DropDown
              ref={searchFilterStatusRef}
              forInput="ddStatus"
              label="Status"
              type="none"
              arrData={dataFilterStatus}
              defaultValue="Aktif"
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
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
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
  );
}
