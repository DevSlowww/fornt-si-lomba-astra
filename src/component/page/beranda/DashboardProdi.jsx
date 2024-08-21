import React, { useEffect, useState } from "react";
import CardDashboard from "../../part/CardDashboard";
import LineChart from "../../chart/Line";
import UseFetch from "../../util/UseFetch";
import { API_LINK } from "../../util/Constants";
import BarChart from "../../chart/Bar";

export default function DashboardProdi() {
  const titles = ["Jumlah Lomba Aktif", "Pendaftar Lomba"];
  const [dataCard, setDataCard] = useState([]);
  const icons = ["fi-br-users-alt", "fi-br-trophy"];

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartDataPendaftar, setChartDataPendaftar] = useState({
    labels: [],
    datasets: [],
  });
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

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

  const chartOptions = {
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  const [filterBulan, setFilterBulan] = useState(getCurrentMonth);

  useEffect(() => {
    let isMounted = true;
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
    const fetchData = async () => {
      setIsError({ error: false, message: "" });
      setIsLoading(true);

      try {
        const data = await UseFetch(
          API_LINK + "MasterLomba/GetLombaAktifDs",
          {}
        );
        const dataJumlah = await UseFetch(
          API_LINK + "MasterLomba/GetJumlahLombaNPendaftar",
          {}
        );
        const dataPendaftar = await UseFetch(
          API_LINK + "MasterLomba/GetLombaPendaftarDs",
          {}
        );

        if (isMounted) {
          if (data === "ERROR" || data.length === 0) {
            throw new Error("Terjadi kesalahan: Gagal mengambil data Lomba");
          } else {
            const chartLabels = data.map((item) => item.Bulan);
            const chartDataValues = data.map((item) => item.Jumlah_Lomba);

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
              dataJumlah[0].Jumlah_Lomba_Aktif,
              dataJumlah[0].Jumlah_Pendaftar_Lomba,
            ]);

            setChartDataPendaftar({
              labels: chartLabels2,
              datasets: [
                {
                  label: "Jumlah Pendaftar Lomba",
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

    return () => {
      (isMounted = false), clearInterval(interval);
    };
  }, [filterBulan]);
  return (
    <div className="container-fluid my-4">
      <CardDashboard title={titles} data={dataCard} icons={icons} />
      <div className="card">
        <div className="card-header bg-primary text-white">
          <span className="fw-medium">Dashboard Prodi - {currentDateTime}</span>
        </div>
        <div className="card-body lead p-4">
          <div className="container">
            <div className="row">
              <div className="col-6">
                <h3>Jumlah Lomba</h3>
                <BarChart chartData={chartData} options={chartOptions} />
              </div>
              <div className="col-6">
                <h3>Jumlah Pendaftar Lomba</h3>
                <BarChart
                  chartData={chartDataPendaftar}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
