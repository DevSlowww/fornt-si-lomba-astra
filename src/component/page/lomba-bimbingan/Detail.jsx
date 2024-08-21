import { useEffect, useRef, useState } from "react";
import { API_LINK, FILE_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

export default function LombaDospemDetail({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [namaTopik, setNamaTopik] = useState("");

  const formDataRef = useRef({
    kodeLomba: "",
    namaLomba: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    kategoriLomba: "",
    topikLomba: "",
    jenisLomba: "",
    tingkatanLomba: "",
    penyelenggaraLomba: "",
    pelaksanaLomba: "",
    lokasiLomba: "",
    deskripsiLomba: "",
    posterLomba: "",
    statusLomba: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "DospemLomba/GetDataDospemLombaById",
          {
            id: withID,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Lomba.");
        } else {
          data[0].tanggalMulai = new Date(data[0].tanggalMulai)
            .toISOString()
            .split("T")[0];
          data[0].tanggalSelesai = new Date(data[0].tanggalSelesai)
            .toISOString()
            .split("T")[0];
          formDataRef.current = { ...formDataRef.current, ...data[0] };
          // Fetch the topic name based on the topic ID
          const topicData = await UseFetch(API_LINK + "Topik/DetailTopik", {
            id: formDataRef.current.topikLomba,
          });

          if (topicData !== "ERROR" && topicData.length > 0) {
            setNamaTopik(topicData[0].namaTopik);
          } else {
            setNamaTopik("Unknown Topic");
          }
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <div className="card">
        <div className="card-header bg-primary fw-medium text-white">
          Detail Data Lomba
        </div>
        <div className="card-body p-4">
          <div className="row">
            {/* {<div className="col-lg-3">
              <Label
                forLabel="kodeLomba"
                title="Kode Lomba"
                data={formDataRef.current.kodeLomba}
              />
            </div>} */}
            <div className="col-lg-3">
              <Label
                forLabel="namaLomba"
                title="Nama Lomba"
                data={formDataRef.current.namaLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tanggalMulai"
                title="Tanggal Mulai Lomba"
                data={formDataRef.current.tanggalMulai}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tanggalSelesai"
                title="Tanggal Selesai Lomba"
                data={formDataRef.current.tanggalSelesai}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="kategoriLomba"
                title="Kategori Lomba"
                data={formDataRef.current.kategoriLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="topikLomba"
                title="Topik Lomba"
                data={formDataRef.current.topikLomba}
              />
            </div>
            {/* <div className="col-lg-3">
              <Label
                forLabel="topikLomba"
                title="Topik Lomba"
                data={namaTopik}
              />
            </div> */}
            <div className="col-lg-3">
              <Label
                forLabel="jenisLomba"
                title="Jenis Lomba"
                data={formDataRef.current.jenisLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="tingkatanLomba"
                title="Tingkatan Lomba"
                data={formDataRef.current.tingkatanLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="penyelenggaraLomba"
                title="Penyelenggara Lomba"
                data={formDataRef.current.penyelenggaraLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="pelaksanaanLomba"
                title="Pelaksanaan Lomba"
                data={formDataRef.current.pelaksanaanLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="lokasiLomba"
                title="Lokasi Lomba"
                data={formDataRef.current.lokasiLomba}
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="deskripsiLomba"
                title="Deskripsi Lomba"
                data={formDataRef.current.deskripsiLomba}
              />
            </div>
            <div className="col-lg-6">
              <Label
                forLabel="posterLomba"
                title="Poster Lomba"
                data={
                  <img
                    src={`${API_LINK}Utilities/getImage/${formDataRef.current.posterLomba}`}
                    // alt="Poster Lomba"
                    style={{ width: "100%" }}
                  />
                }
              />
            </div>
            <div className="col-lg-3">
              <Label
                forLabel="statusLomba"
                title="Status"
                data={formDataRef.current.statusLomba}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="float-end my-4 mx-1">
        <Button
          classType="secondary px-4 py-2"
          label="KEMBALI"
          onClick={() => onChangePage("index")}
        />
      </div>
    </>
  );
}
