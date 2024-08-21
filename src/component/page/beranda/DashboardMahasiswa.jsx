import { useEffect, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Modal from "react-bootstrap/Modal"; 
import Button from "react-bootstrap/Button";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";

export default function DashboardMahasiswa() {
  const [dataCard, setDataCard] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartDataPendaftar, setChartDataPendaftar] = useState({ labels: [], datasets: [] });
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getDayName = (date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  const getMonthName = (date) => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return months[date.getMonth()];
  };

  const padZero = (num) => num.toString().padStart(2, "0");

  const getCurrentMonth = () => new Date().getMonth() + 1;

  const [filterBulan, setFilterBulan] = useState(getCurrentMonth);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsLoading(true);

      try {
        const data = await UseFetch(API_LINK + "MasterLomba/GetLombaAktifDs", {});
        const dataJumlah = await UseFetch(API_LINK + "Bimbingan/GetJumlahLombaNMahasiswaBimbingan", {});
        const dataPendaftar = await UseFetch(API_LINK + "MasterLomba/GetLombaPendaftarDs", {});
        const dataLombaAktif = await UseFetch(API_LINK + "MasterLomba/GetDataLombaDs", {});

        if (isMounted) {
          if (data === "ERROR" || data.length === 0) {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Lomba");
          } else {
            const chartLabels = data.map((item) => item.Bulan);
            const chartDataValues = data.map((item) => item.Jumlah_Lomba);
            setCurrentData(dataLombaAktif);
            setChartData({
              labels: chartLabels,
              datasets: [{
                label: "Jumlah Lomba",
                borderColor: "navy",
                pointRadius: 0,
                fill: true,
                backgroundColor: "#0D6EFD",
                lineTension: 0.4,
                data: chartDataValues,
                borderWidth: 1,
              }],
            });

            const chartLabels2 = dataPendaftar.map((item) => item.Bulan);
            const chartDataValues2 = dataPendaftar.map((item) => item.Jumlah_Pendaftar);
            setDataCard([
              dataJumlah[0].Jumlah_Mahasiswa,
              dataJumlah[0].Jumlah_Lomba,
            ]);

            setChartDataPendaftar({
              labels: chartLabels2,
              datasets: [{
                label: "Jumlah Pendaftar",
                borderColor: "navy",
                pointRadius: 0,
                fill: true,
                backgroundColor: "#0D6EFD",
                lineTension: 0.4,
                data: chartDataValues2,
                borderWidth: 1,
              }],
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
      const formattedDateTime = `${getDayName(now)}, ${now.getDate()} ${getMonthName(now)} ${now.getFullYear()} | ${padZero(now.getHours())}.${padZero(now.getMinutes())}`;
      setCurrentDateTime(formattedDateTime);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [filterBulan]);

  return (
    <div className="container-fluid my-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <span className="fw-medium">
            Dashboard Mahasiswa - {currentDateTime}
          </span>
        </div>
        <div className="card-body lead p-4">
          <div className="container">
            <div className="row">
              <Carousel>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <Carousel.Item key={item.idLomba || index}>
                      <div className="container my-2">
                        <div className="row">
                          <div className="col-6">
                            <img
                              src={`${API_LINK}Utilities/getImage/${item.posterLomba}`}
                              alt="Poster Lomba"
                              style={{ width: "75%" }}
                            />
                          </div>
                          <div className="col-6">
                            <p><strong>Nama Lomba:</strong> {item.namaLomba}</p>
                            <p><strong>Tanggal Mulai:</strong> {new Date(item.tanggalMulai).toLocaleDateString()}</p>
                            <p><strong>Tanggal Selesai:</strong> {item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString() : "N/A"}</p>
                            <p><strong>Deskripsi:</strong> {item.deskripsiLomba}</p>
                            <p><strong>Penyelenggara:</strong> {item.penyelenggaraLomba}</p>
                          </div>
                        </div>
                      </div>
                    </Carousel.Item>
                  ))
                ) : (
                  <p className="text-center">Tidak ada Lomba Yang Aktif</p>
                )}
              </Carousel>
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
