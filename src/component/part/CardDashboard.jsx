import React from "react";

export default function CardDashboard({ title, data, icons }) {
  // Function to determine the column size based on title.length
  const getColClass = () => {
    if (title.length === 1) return "col-12";
    if (title.length === 2) return "col-6";
    if (title.length === 3) return "col-4";
    return "col-xl-3 col-md-6"; // Default to 4 or more cards
  };

  const colClass = getColClass();

  return (
    <div className="row">
      {Array.from({ length: title.length }).map((_, index) => (
        <div className={`${colClass} mb-4`} key={index}>
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    {title[index]}
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {data[index]}
                  </div>
                </div>
                <div className="col-auto">
                  <i className={`fi ${icons[index]}  display-6`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
