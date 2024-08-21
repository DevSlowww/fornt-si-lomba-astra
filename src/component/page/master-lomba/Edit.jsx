import { useEffect, useRef, useState } from "react";
import * as yup from "yup"; // Correctly import yup
import { date, object, string } from "yup"; // Import necessary yup validation methods
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UploadFile from "../../util/UploadFile";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
const listkategoriLomba = [
  { Value: "Puspresnas", Text: "Puspresnas" },
  { Value: "Universitas", Text: "Universitas" },
  { Value: "lembaga lainnya", Text: "lembaga lainnya" },
];

const listtingkatanLomba = [
  { Value: "Regional", Text: "Regional" },
  { Value: "Nasional", Text: "Nasional" },
  { Value: "Internasional", Text: "Internasional" },
];

const listjenisLomba = [
  { Value: "Online", Text: "Online" },
  { Value: "Offline", Text: "Offline" },
  { Value: "Hybrid", Text: "Hybrid" },
];

export default function MasterLombaEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listTopik, setListTopik] = useState({});
  const [selectedTopik, setSelectedTopik] = useState("");
  const [selectedKategoriLomba, setSelectedKategoriLomba] = useState("");
  const [selectedJenisLomba, setSelectedJenisLomba] = useState("");
  const [selectedTingkatanLomba, setSelectedTingkatanLomba] = useState("");

  const filePosterLombaRef = useRef(null);

  const handleKategoriLombaChange = (event) => {
    setSelectedKategoriLomba(event.target.value);
    handleInputChange(event);
  };

  const [dataBimbingan, setDataBimbingan] = useState([]);

  const formDataRef = useRef({
    idLomba: "",
    namaLomba: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    kategoriLomba: "",
    topikId: "",
    jenisLomba: "",
    tingkatanLomba: "",
    penyelenggaraLomba: "",
    linkGuideBook: "",
    lokasiLomba: "",
    deskripsiLomba: "",
    posterLomba: "",
    statusLomba: "aktif",
    modifiedBy: "ehe",
  });

  delete formDataRef.current.createdBy;
  delete formDataRef.current.createdDate;
  delete formDataRef.current.modifiedDate;

  const listjenisLombaOptions = listkategoriLomba.find(
    (item) => item.Value === formDataRef.current["kategoriLomba"]
  );
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterLomba/GetDataLombaById",
          {
            id: withID,
          }
        );
        const dataTopik = await UseFetch(
          API_LINK + "Utilities/GetListTopik",
          {}
        );

        if (isMounted) {
          if (data === "ERROR" || data.length === 0) {
            throw new Error("Terjadi kesalahan: Gagal mengambil data /Lomba");
          } else {
            data[0].tanggalMulai = new Date(data[0].tanggalMulai)
              .toISOString()
              .split("T")[0];
            data[0].tanggalSelesai = new Date(data[0].tanggalSelesai)
              .toISOString()
              .split("T")[0];

            formDataRef.current = { ...formDataRef.current, ...data[0] };
            setDataBimbingan(data);
            setListTopik(dataTopik);
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsError((prevError) => ({
            ...prevError,
            error: true,
            message: error.message,
          }));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [withID]);

  const userSchema = object({
    idLomba: string(),
    namaLomba: string()
      .max(100, "maksimum 100 karakter")
      .required("harus diisi"),
    tanggalMulai: date().required("harus diisi"),
    tanggalSelesai: date().required("harus diisi"),
    kategoriLomba: string(),
    topikId: string(),
    topikLomba: string(),
    jenisLomba: string(),
    tingkatanLomba: string(),
    penyelenggaraLomba: string().max(100, "maksimum 100 karakter"),
    linkGuideBook: string().max(100, "maksimum 100 karakter"),
    lokasiLomba: string().max(100, "maksimum 100 karakter"),
    deskripsiLomba: string().max(1000, "maksimum 1000 karakter"),
    posterLomba: string().max(250, "maksimum 250 karakter"),
    modifiedBy: string(),
    statusLomba: string().required(),
  });

  useEffect(() => {
    formDataRef.current.modifiedBy = "yosep.setiawan";
  });
  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;
    const validationError = await validateInput(name, value, userSchema);
    if (name === "tanggalMulai" || name === "tanggalSelesai") {
      const startDate = parseDate(formDataRef.current.tanggalMulai);
      const endDate = parseDate(formDataRef.current.tanggalSelesai);
      console.log(startDate + " // " + endDate); // Ensure the dates are parsed correctly

      if (startDate > endDate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          tanggalSelesai:
            "Tanggal selesai harus lebih besar dari tanggal mulai",
          tanggalMulai:
            "Tanggal mulai tidak boleh lebih besar dari tanggal selesai",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          tanggalSelesai: "",
          tanggalMulai: "",
        }));
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [validationError.name]: validationError.error,
      }));
    }
  };

  const handleFileChange = async (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) {
      ref.current.value = "";
    } else {
      console.log(fileName);
      formDataRef.current["posterLomba"] = fileName;
      handleInputChange({ target: { name: "posterLomba", value: fileName } });
      console.log(formDataRef.current);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    console.log(validationErrors);
    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        let uploadedFileName = "";
        if (filePosterLombaRef.current.files.length > 0) {
          const file = filePosterLombaRef.current.files[0];
          const formData = new FormData();
          formData.append("file", file);

          const uploadResponse = await fetch(`${API_LINK}Utilities/Upload`, {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) throw new Error("Failed to upload file");

          const uploadResponseText = await uploadResponse.text();
          const uploadResponseJson = JSON.parse(uploadResponseText);
          const newFileName = uploadResponseJson.newFileName;
          formDataRef.current.posterLomba = newFileName;
        }
        const data = await UseFetch(
          // $ API_LINK + "MasterLomba/EditLomba",
          `${API_LINK}MasterLomba/EditLomba`,
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data lomba.");
        } else {
          SweetAlert("Sukses", "Data lomba berhasil disimpan", "success");
          console.log(formDataRef.current);
          onChangePage("index");
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
    }
  };

  console.log(dataBimbingan);

  if (isLoading) return <Loading />;

  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <form onSubmit={handleAdd}>
        <div className="card">
          <div className="card-header bg-primary fw-medium text-white">
            Edit Data Lomba
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="namaLomba"
                  label="Nama Lomba"
                  isRequired
                  value={formDataRef.current.namaLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.namaLomba}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="tanggalMulai"
                  label="Tanggal Mulai Lomba"
                  isRequired
                  value={formDataRef.current.tanggalMulai}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalMulai}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="tanggalSelesai"
                  label="Tanggal Selesai Lomba"
                  value={formDataRef.current.tanggalSelesai}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalSelesai}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="kategoriLomba"
                  label="Kategori Lomba"
                  arrData={listkategoriLomba}
                  value={formDataRef.current.kategoriLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.kategoriLomba}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="topikId"
                  label="Topik Lomba"
                  arrData={listTopik}
                  value={formDataRef.current.topikId}
                  onChange={handleInputChange}
                  errorMessage={errors.topikId}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="jenisLomba"
                  label="Jenis Lomba"
                  arrData={listjenisLomba}
                  value={formDataRef.current.jenisLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.jenisLomba}
                />
              </div>
              {/* <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="tingkatanLomba"
                  label="Tingkatan Lomba"
                  isRequired
                  value={formDataRef.current.tingkatanLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.tingkatanLomba}
                />
              </div> */}
              <div className="col-lg-3">
                <DropDown
                  forInput="tingkatanLomba"
                  label="Tingkatan Lomba"
                  arrData={listtingkatanLomba}
                  value={formDataRef.current.tingkatanLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.tingkatanLombaa}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="linkGuideBook"
                  label="Link GuideBook"
                  value={formDataRef.current.linkGuideBook}
                  onChange={handleInputChange}
                  errorMessage={errors.linkGuideBook}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="penyelenggaraLomba"
                  label="Penyelenggara Lomba"
                  value={formDataRef.current.penyelenggaraLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.penyelenggaraLomba}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="lokasiLomba"
                  label="Lokasi Lomba"
                  isRequired
                  value={formDataRef.current.lokasiLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.lokasiLomba}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="textarea"
                  forInput="deskripsiLomba"
                  label="Deskripsi Lomba"
                  value={formDataRef.current.deskripsiLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.deskripsiLomba}
                />
              </div>
              <div className="col-lg-3">
                <FileUpload
                  forInput="posterLomba"
                  label="Poster Lomba (.jpg, .png)"
                  formatFile=".jpg,.png"
                  ref={filePosterLombaRef}
                  onChange={() =>
                    handleFileChange(filePosterLombaRef, "jpg,png")
                  }
                  errorMessage={errors.posterLomba}
                  hasExisting={formDataRef.current.posterLomba}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="SIMPAN"
          />
        </div>
      </form>
    </>
  );
}
