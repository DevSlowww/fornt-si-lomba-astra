import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../util/Constants";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Input from "../../part/Input";
import Card from "../../part/Card";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";

const initialData = [
  {
    Key: null,
    No: null,
    "Nama Lomba": null,
    "Penyelenggara": null,
    Status: null,
    Count: 0,
  },
];

const sortOptions = [
  { Value: "[Nama Lomba] asc", Text: "Nama Lomba [↑]" },
  { Value: "[Nama Lomba] desc", Text: "Nama Lomba [↓]" },
  { Value: "[Penyelenggara] asc", Text: "Penyelenggara Lomba [↑]" },
  { Value: "[Penyelenggara] desc", Text: "Penyelenggara Lomba [↓]" },
];

const statusOptions = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function LombaMahasiswaIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(initialData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Lomba] asc",
    status: "Aktif",
  });

  const searchQueryRef = useRef(null);
  const searchFilterSortRef = useRef(null);
  const searchFilterStatusRef = useRef(null);
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
      penyelenggara: searchFilterPenyelenggaraRef.current?.value || "",
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      try {
        const fetchedData = await UseFetch(
          API_LINK + "MahasiswaLomba/GetDataMahasiswaLomba",
          currentFilter
        );

        if (fetchedData === "ERROR") {
          setIsError(true);
        } else if (fetchedData.length === 0) {
          setCurrentData([]);
        } else {
          const formattedData = fetchedData.map((value) => ({
            ...value,
            Aksi: ["Detail", "Add"],
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
          </Filter>
        </div>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <Loading />
        ) : currentData.length === 0 ? (
          <div className="text-center">Lomba Belum Tersedia</div>
        ) : (
          <div className="d-flex flex-column">
            <div className="row">
              {currentData.map((item) => (
                <div className="col-md-4" key={item.Key}>
                  <Card
                    data={item}
                    onDetail={onChangePage}
                    onAdd={onChangePage}
                  />
                </div>
              ))}
            </div>
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
