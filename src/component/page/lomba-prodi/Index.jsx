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

const initialData = [
  {
    Key: null,
    No: null,
    "Kode Lomba": null,
    "Nama Lomba": null,
    "Tanggal Mulai Lomba": null,
    "Tanggal Selesai Lomba": null,
    "Kategori Lomba": null,
    "Topik Lomba": null,
    "Jenis Lomba": null,
    "Tingkatan Lomba": null,
    "Penyelenggara Lomba": null,
    "Pelaksanaan Lomba": null,
    "Lokasi Lomba": null,
    "Deskripsi Lomba": null,
    "Poster Lomba": null,
    Status: null,
    Count: 0,
  },
];

const sortOptions = [
  { Value: "[Nama Lomba] asc", Text: "Nama Lomba [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama Lomba [↓]" },
  // { Value: "[Nama Topik] asc", Text: "Topik Lomba [↑]" },
  // { Value: "[Nama Topik] desc", Text: "Topik Lomba [↓]" },
  { Value: "[Penyelenggara] asc", Text: "Penyelenggara Lomba [↑]" },
  { Value: "[Penyelenggara] desc", Text: "Penyelenggara Lomba [↓]" },
];

const statusOptions = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

// Fungsi untuk mengambil nama topik berdasarkan top_id
const fetchNamaTopik = async (topId) => {
  // Lakukan operasi pengambilan nama topik berdasarkan top_id, misalnya dengan memanggil API
  // Contoh:
  // const response = await fetch(API_LINK + `topik/${topId}`);
  // const data = await response.json();
  // return data.nama_topik;
  return "Nama Topik"; // Contoh sederhana, mengembalikan string "Nama Topik" sebagai contoh
};

export default function LombaProdiIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Lomba] asc",
    status: "Aktif",
    // nama_topik: "",
    penyelenggara: "",
  });

  const searchQueryRef = useRef(null);
  const searchFilterSortRef = useRef(null);
  const searchFilterStatusRef = useRef(null);
  // const searchFilterNamaTopikRef = useRef(null);
  const searchFilterPenyelenggaraRef = useRef(null);
  // const [topikData, setTopikData] = useState({});

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
      // nama_topik: searchFilterNamaTopikRef.current?.value || "",
      penyelenggara: searchFilterPenyelenggaraRef.current?.value || "",
    }));
  };

  const fetchNamaTopik = async (topId) => {
    try {
      const response = await fetch(API_LINK + `MasterTopik/GetDataTopik`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ top_id: topId }),
      });
      const data = await response.json();
      return data; // Mengembalikan nama topik dari respons backend
    } catch (error) {
      console.error("Error fetching topik data:", error);
      return ""; // Mengembalikan string kosong jika terjadi kesalahan
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const fetchedData = await UseFetch(
          API_LINK + "ProdiLomba/GetDataProdiLomba",
          currentFilter
        );

        if (fetchedData === "ERROR") {
          setIsError(true);
        } else if (fetchedData.length === 0) {
          setCurrentData(initialData);
        } else {
          const formattedData = fetchedData.map((value) => ({
            ...value,
            // Aksi: ["Toggle", "Detail", "Edit"],
            Aksi: ["Detail"],
            // Alignment: ["center", "center", "left", "left", "center", "center"],
            Alignment: ["center", "center", "center", "center"],
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsError(false);
  //     try {
  //       const data = await UseFetch(
  //         API_LINK + "MasterLomba/GetDataLomba",
  //         currentFilter
  //       );

  //       if (data === "ERROR") {
  //         setIsError(true);
  //       } else if (data.length === 0) {
  //         setCurrentData(initialData);
  //       } else {
  //         const formattedData = data.map((value) => ({
  //           ...value,
  //           Aksi: ["Toggle", "Detail", "Edit"],
  //           Alignment: ["center", "center", "left", "left", "center", "center"],
  //         }));
  //         setCurrentData(formattedData);
  //       }
  //     } catch {
  //       setIsError(true);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [currentFilter]);

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
          {/* <Button
            iconName="add"
            classType="success"
            label="Tambah"
            onClick={() => onChangePage("add")}
          /> */}
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
              arrData={sortOptions}
              defaultValue="[Nama Lomba] asc"
            />
            <DropDown
              ref={searchFilterStatusRef}
              forInput="ddStatus"
              label="Status"
              type="none"
              arrData={statusOptions}
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
            {/* <Table
              data={currentData}
              onToggle={handleSetStatus}
              onDetail={onChangePage}
              onEdit={onChangePage}
            /> */}
            <Table
              data={currentData}
              onDetail={onChangePage}
              // onEdit={onChangePage}
              renderRow={async (rowData, index) => {
                const newData = { ...rowData };
                newData["Nama Topik"] = await fetchNamaTopik(
                  rowData["Topik Lomba"]
                );
                return newData;
              }}
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
