import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";


const listkategoriLomba = [
  { Value: "Puspresnas", Text: "Puspresnas" },
  { Value: "Universitas", Text: "Universitas" },
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

export default function MasterLombaAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const filePosterLombaRef = useRef(null);

  const [selectedKategoriLomba, setSelectedKategoriLomba] = useState("");
  const [selectedTopik, setSelectedTopik] = useState("");
  const [listTopik, setListTopik] = useState({});

  const handleKategoriLombaChange = (event) => {
    setSelectedKategoriLomba(event.target.value);
    handleInputChange(event);
  };

  const formDataRef = useRef({
    namaLomba: "",
    tanggalmulaiLomba: "",
    tanggalselesaiLomba: "",
    kategoriLomba: "",
    topikLomba: "",
    jenisLomba: "",
    tingkatanLomba: "",
    penyelenggaraLomba: "",
    linkGuideBook: "",
    lokasiLomba: "",
    deskripsiLomba: "",
    posterLomba: "",
  });

  const userSchema = object({
    namaLomba: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
      tanggalmulaiLomba: string().required("Harus diisi"),
    // tanggalmulaiLomba: string().required("Harus diisi / di Pilih Tanggal Mulai Lomba nya"),
    tanggalselesaiLomba: string().required("Harus diisi"),
       // tanggalselesaiLomba: string().required("Harus diisi / di Pilih Tanggal Selesai Lomba nya"),
    kategoriLomba: string().required("Harus diisi"),
    // kategoriLomba: string().required("Harus diisi / di Pilih Kategori Lomba"),
    topikLomba: string().required("Harus diisi"),
    // topikLomba: string().required("Harus diisi / di Pilih Topik Lomba"),
    jenisLomba: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    tingkatanLomba: string()
      .required("Harus diisi")
      .max(100, "Maksimum 100 karakter"),
    penyelenggaraLomba: string()
      .required("Harus diisi")
      .max(100, "Maksimum 100 karakter"),
    linkGuideBook: string()
      .required("Harus diisi")
      .max(100, "Maksimum 100 karakter"),
    lokasiLomba: string()
      .required("Harus diisi")
      .max(100, "Maksimum 100 karakter"),
    deskripsiLomba: string()
      .required("Harus diisi")
      .max(1000, "Maksimum 1000 karakter"),
    posterLomba: string().required("Harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetListTopik",
          {}
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar topik.");
        } else {
          setListTopik(data);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setListTopik({});
      }
    };

    fetchData();
  }, []);

  const fetchDataByEndpointAndParams = async (
    endpoint,
    params,
    setter,
    errorMessage
  ) => {
    setIsError({ error: false, message: "" });
    try {
      const data = await UseFetch(endpoint, params);
      if (data === "ERROR") throw new Error(errorMessage);
      setter(data);
    } catch (error) {
      setIsError({ error: true, message: error.message });
      setter({});
    }
  };
  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;
    const validationError = await validateInput(name, value, userSchema);
    if (name === "tanggalmulaiLomba" || name === "tanggalselesaiLomba") {
      const startDate = parseDate(formDataRef.current.tanggalmulaiLomba);
      const endDate = parseDate(formDataRef.current.tanggalselesaiLomba);
      console.log(startDate + " // " + endDate); // Ensure the dates are parsed correctly

      if (startDate > endDate) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          tanggalselesaiLomba:
            "Tanggal selesai harus lebih besar dari tanggal mulai",
          tanggalmulaiLomba:
            "Tanggal mulai tidak boleh lebih besar dari tanggal selesai",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          tanggalselesaiLomba: "",
          tanggalmulaiLomba: "",
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

    if (fileSize / 1024576 > 10) error = "Berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) ref.current.value = "";
    else {
      formDataRef.current.posterLomba = fileName;
      handleInputChange({ target: { name: "posterLomba", value: fileName } });
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

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });
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

        const dataResponse = await UseFetch(
          `${API_LINK}MasterLomba/CreateLomba`,
          formDataRef.current
        );

        if (dataResponse === "ERROR")
          throw new Error("Terjadi kesalahan: Gagal menyimpan data lomba.");

        SweetAlert("Sukses", "Data lomba berhasil disimpan", "success");
        onChangePage("index");
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

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
            Tambah Data Lomba Baru
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
                  forInput="tanggalmulaiLomba"
                  label="Tanggal Mulai Lomba"
                  isRequired
                  value={formDataRef.current.tanggalmulaiLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalmulaiLomba}
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="date"
                  forInput="tanggalselesaiLomba"
                  label="Tanggal Selesai Lomba"
                  isRequired
                  value={formDataRef.current.tanggalselesaiLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.tanggalselesaiLomba}
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="kategoriLomba"
                  label="Kategori Lomba"
                  arrData={listkategoriLomba}
                  value={selectedKategoriLomba}
                  onChange={handleKategoriLombaChange}
                  errorMessage={errors.kategoriLomba}
                  isRequired
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="topikLomba"
                  label="Topik Lomba"
                  arrData={listTopik}
                  value={formDataRef.current.topikLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.topikLomba}
                  isRequired
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
                  isRequired
                />
              </div>
              <div className="col-lg-3">
                <DropDown
                  forInput="tingkatanLomba"
                  label="Tingkatan Lomba"
                  arrData={listtingkatanLomba}
                  value={formDataRef.current.tingkatanLomba}
                  onChange={handleInputChange}
                  errorMessage={errors.tingkatanLomba}
                  isRequired
                />
              </div>
              <div className="col-lg-3">
                <Input
                  type="text"
                  forInput="linkGuideBook"
                  label="Link Guide Book"
                  value={formDataRef.current.linkGuideBook}
                  onChange={handleInputChange}
                  errorMessage={errors.linkGuideBook}
                  isRequired
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
                  isRequired
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
                  isRequired
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
                  isRequired
                />
              </div>
            </div>
          </div>
        </div>
        <div className="float-end my-4 mx-1">
          <Button
            classType="secondary me-2 px-4 py-2"
            label="BATAL"
            onClick={() => onChangePage("Index")}
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
