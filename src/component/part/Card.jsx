import React from "react";
import { API_LINK } from "../util/Constants"; // Ensure this path is correct

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID"); // Adjust locale or format as needed
};

const Card = ({ data, onDetail, onAdd }) => {
  console.log(data);
  // Handle image URL and fallback
  const posterUrl = data["PosterLomba"]
    ? `${API_LINK}Utilities/getImage/${data["PosterLomba"]}`
    : "/path/to/fallback-image.png"; // Replace with the path to a fallback image

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{data["Nama Lomba"]}</h5>
        <p className="card-text">Penyelenggara: {data["Penyelenggara"]}</p>
        <p className="card-text">Tanggal Mulai: {formatDate(data["TanggalMulai"])}</p>
        <p className="card-text">Tanggal Selesai: {formatDate(data["TanggalSelesai"])}</p>
        <div className="mb-3">
          <img
            src={posterUrl}
            alt={data["Nama Lomba"]}
            style={{ width: "65%", height: "auto" }} // Adjust styles as needed
          />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-info me-2" onClick={() => onDetail(data)}>Detail</button>
          <button className="btn btn-info me-2" onClick={() => onAdd(data)}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default Card;
