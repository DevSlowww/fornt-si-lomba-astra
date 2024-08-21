import { useEffect, useRef, useState } from "react";
import CardDashboard from "../../part/CardDashboard";
import LineChart from "../../chart/Line";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";
import Carousel from "react-bootstrap/Carousel";
import Label from "../../part/Label";
import Modal from "react-bootstrap/Modal"; 
import Button from "react-bootstrap/Button";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Nama: null,
    Tanggal: null,
    Pembimbing: null,
    Count: 0,
  },
];

export default function DashboardDosenPembimbing() {
  const titles = ["Jumlah Lomba Dibimbing", "Jumlah Mahasiswa Dibimbing"];
  const [dataCard, setDataCard] = useState([]);
  const icons = ["fi-br-users-alt", "fi-br-trophy"];
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
    linkGuideBook: "",
    lokasiLomba: "",
    deskripsiLomba: "",
    posterLomba: "",
    statusLomba: "",
  });

  const [currentData, setCurrentData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartDataPendaftar, setChartDataPendaftar] = useState({
    labels: [],
    datasets: [],
  });
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getDayName = (date) => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    return days[date.getDay()];
  };

  const getMonthName = (date) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[date.getMonth()];
  };

  const padZero = (num) => {
    return num.toString().padStart(2, "0");
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return now.getMonth() + 1;
  };

  const [filterBulan, setFilterBulan] = useState(getCurrentMonth);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsLoading(true);
    
      try {
        const data = await UseFetch(
          API_LINK + "MasterLomba/GetLombaAktifDs",
          {}
        );
        const dataJumlah = await UseFetch(
          API_LINK + "Bimbingan/GetJumlahLombaNMahasiswaBimbingan",
          {}
        );
        const dataPendaftar = await UseFetch(
          API_LINK + "MasterLomba/GetLombaPendaftarDs",
          {}
        );
        const dataLombaAktif = await UseFetch(
          API_LINK + "MasterLomba/GetDataLombaDs",
          {}
        );
    
        if (isMounted) {
          if (data === "ERROR" || data.length === 0) {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Lomba");
          } else {
            const chartLabels = data.map((item) => item.Bulan);
            const chartDataValues = data.map((item) => item.Jumlah_Lomba);
            setCurrentData(dataLombaAktif); 
            setChartData({
              labels: chartLabels,
              datasets: [
                {
                  label: "Jumlah Lomba",
                  borderColor: "navy",
                  pointRadius: 0,
                  fill: true,
                  backgroundColor: "#0D6EFD",
                  lineTension: 0.4,
                  data: chartDataValues,
                  borderWidth: 1,
                },
              ],
            });
    
            const chartLabels2 = dataPendaftar.map((item) => item.Bulan);
            const chartDataValues2 = dataPendaftar.map(
              (item) => item.Jumlah_Pendaftar
            );
            setDataCard([
              dataJumlah[0].Jumlah_Mahasiswa,
              dataJumlah[0].Jumlah_Lomba,
            ]);
    
            setChartDataPendaftar({
              labels: chartLabels2,
              datasets: [
                {
                  label: "Jumlah Lomba",
                  borderColor: "navy",
                  pointRadius: 0,
                  fill: true,
                  backgroundColor: "#0D6EFD",
                  lineTension: 0.4,
                  data: chartDataValues2,
                  borderWidth: 1,
                },
              ],
            });
    
            if (dataLombaAktif.length === 0) {
              setShowModal(true);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError({ error: true, message: error.message });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDateTime = `${getDayName(
        now
      )}, ${now.getDate()} ${getMonthName(
        now
      )} ${now.getFullYear()} | ${padZero(now.getHours())}.${padZero(
        now.getMinutes()
      )}`;
      setCurrentDateTime(formattedDateTime);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [filterBulan]);

  return (
    <div className="container-fluid my-4">
      <CardDashboard title={titles} data={dataCard} icons={icons} />
      <div className="card">
        <div className="card-header bg-primary text-white">
          <span className="fw-medium">
            Dashboard Dosen Pembimbing - {currentDateTime}
          </span>
        </div>
        <div className="card-body lead p-4">
          <div className="container">
            <div className="row">
              {currentData.length > 0 ? (
                <Carousel>
                  {currentData.map((item) => (
                    <Carousel.Item key={item.idLomba}>
                      <div className="container my-2">
                        <div className="row">
                          <div className="col-6">
                            <img
                              src={`${API_LINK}Utilities/getImage/${item.posterLomba}`}
                              alt="Poster Lomba"
                              style={{ width: "50%" }}
                            />
                          </div>
                          <div className="col-6">
                            <p>
                              <strong>Nama Lomba:</strong> {item.namaLomba}
                            </p>
                            <p>
                              <strong>Tanggal Mulai:</strong>{" "}
                              {new Date(item.tanggalMulai).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Tanggal Selesai:</strong>{" "}
                              {item.tanggalSelesai
                                ? new Date(
                                    item.tanggalSelesai
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                            <p>
                              <strong>Deskripsi:</strong> {item.deskripsiLomba}
                            </p>
                            <p>
                              <strong>Penyelenggara:</strong>{" "}
                              {item.penyelenggaraLomba}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <p className="text-center">Tidak ada Lomba Yang Aktif</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Informasi</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tidak ada Lomba Yang Aktif</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
