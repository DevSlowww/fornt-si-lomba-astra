import Icon from "./Icon";

export default function Table({
  data,
  onToggle = () => {},
  onCancel = () => {},
  onDelete = () => {},
  onDetail = () => {},
  onEdit = () => {},
  onApprove = () => {},
  onReject = () => {},
  onStatusThreeDots = () => {},
  onSent = () => {},
  onUpload = () => {},
  onReport = () => {},
  onFinal = () => {},
  onAdd = () => {}, //Tambah
}) {
  let colPosition;
  let colCount = 0;

  function generateActionButton(columnName, value, key, id, status) {
    if (columnName !== "Aksi") return value;

    const listButton = value.map((action) => {
      switch (action) {
        case "Toggle": {
          if (status === "Aktif") {
            return (
              <Icon
                key={key + action}
                name="toggle-on"
                type="Bold"
                cssClass="btn px-1 py-0 text-primary"
                title="Nonaktifkan"
                onClick={() => onToggle(id)}
              />
            );
          } else if (status === "Tidak Aktif") {
            return (
              <Icon
                key={key + action}
                name="toggle-off"
                type="Bold"
                cssClass="btn px-1 py-0 text-secondary"
                title="Aktifkan"
                onClick={() => onToggle(id)}
              />
            );
          }
        }
        case "Cancel":
          return (
            <Icon
              key={key + action}
              name="delete-document"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Batalkan"
              onClick={() => onCancel(id)}
            />
          );
        case "Delete":
          return (
            <Icon
              key={key + action}
              name="trash"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Hapus"
              onClick={() => onDelete(id)}
            />
          );
        case "Detail":
          return (
            <Icon
              key={key + action}
              name="overview"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Lihat Detail"
              onClick={() => onDetail("detail", id)}
            />
          );
        case "Edit":
          return (
            <Icon
              key={key + action}
              name="edit"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Ubah"
              onClick={() => onEdit("edit", id)}
            />
          );
        case "Approve":
          return (
            <Icon
              key={key + action}
              name="check"
              type="Bold"
              cssClass="btn px-1 py-0 text-success"
              title="Setujui Pengajuan"
              onClick={() => onApprove(id)}
            />
          );
        case "Reject":
          return (
            <Icon
              key={key + action}
              name="cross"
              type="Bold"
              cssClass="btn px-1 py-0 text-danger"
              title="Tolak Pengajuan"
              onClick={() => onReject(id)}
            />
          );
        case "StatusThreeDots":
          return (
            <Icon
              key={key + action}
              name="menu-dots"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Ubah Status"
              onClick={() => onStatusThreeDots(id)}
            />
          );
        case "Sent":
          return (
            <Icon
              key={key + action}
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim"
              onClick={() => onSent(id)}
            />
          );
        case "Upload":
          return (
            <Icon
              key={key + action}
              name="file-upload"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Unggah Berkas"
              onClick={() => onUpload(id)}
            />
          );
        case "Report":
          return (
            <Icon
              key={key + action}
              name="note-medical"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Report Data"
              onClick={() => onReport("report", id)}
            />
          );
        case "Final":
          return (
            <Icon
              key={key + action}
              name="gavel"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Finalkan"
              onClick={() => onFinal(id)}
            />
          );
        case "Add":
          return (
            <Icon
              key={key + action}
               name="plus"
              // name="cross"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Tambahkan"
              onClick={() => onAdd("addTable", id)}
            />
          );
        default:
          return null;
      }
    });

    return listButton;
  }

  return (
    <div className="flex-fill">
      <table className="table table-hover table-striped table table-light border">
        <thead>
          <tr>
            {Object.keys(data[0]).map((value, index) => {
              if (
                value !== "Key" &&
                value !== "Count" &&
                value !== "Alignment"
              ) {
                colCount++;
                return (
                  <th key={"Header" + index} className="text-center">
                    {value}
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {data[0].Count !== 0 &&
            data.map((value, rowIndex) => {
              colPosition = -1;
              return (
                <tr
                  key={value["Key"]}
                  className={
                    value["Status"] && value["Status"] === "Draft"
                      ? "fw-bold"
                      : undefined
                  }
                >
                  {Object.keys(value).map((column, colIndex) => {
                    if (
                      column !== "Key" &&
                      column !== "Count" &&
                      column !== "Alignment"
                    ) {
                      colPosition++;
                      return (
                        <td
                          key={rowIndex + "" + colIndex}
                          style={{
                            textAlign: value["Alignment"][colPosition],
                          }}
                        >
                          {generateActionButton(
                            column,
                            value[column],
                            "Action" + rowIndex + colIndex,
                            value["Key"],
                            value["Status"]
                          )}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          {data[0].Count === 0 && (
            <tr>
              <td colSpan={colCount}>Tidak ada data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
