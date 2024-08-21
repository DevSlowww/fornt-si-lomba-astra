import { useRef, useState } from "react";
import { object, string } from "yup";
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

// const listJenisProduk = [
//   { Value: "Part", Text: "Part" },
//   { Value: "Unit", Text: "Unit" },
//   { Value: "Konstruksi", Text: "Konstruksi" },
//   { Value: "Mass Production", Text: "Mass Production" },
//   { Value: "Lainnya", Text: "Lainnya" },
// ];

export default function MasterTopikAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const formDataRef = useRef({
    namaTopik: "",
    // Status: "",
    // top_created_by: "",
    // top_created_date: "",
    // top_modif_by: "",
    // top_modif_date: "",
  });

  // const fileGambarRef = useRef(null);
  const userSchema = object({
    namaTopik: string()
      .max(100, "Maksimum 100 karakter")
      .required("Harus diisi"),
    // Status: string().max(35, "Maksimum 35 karakter"),
    // top_created_by: string().max(100, "Maksimum 100 karakter"),
    // top_created_date: string(),
    // top_modif_by: string().max(100, "Maksimum 100 karakter"),
    // top_modif_date: string(),
  });

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
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

    if (error) ref.current.value = "";

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
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      // const uploadPromises = [];

      // if (fileGambarRef.current.files.length > 0) {
      //   uploadPromises.push(
      //     UploadFile(fileGambarRef.current).then(
      //       (data) => (formDataRef.current["gambarTopik"] = data.Hasil)
      //     )
      //   );
      // }

      try {
        // await Promise.all(uploadPromises);

        const data = await UseFetch(
          API_LINK + "MasterTopik/CreateTopik",
          formDataRef.current
        );

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal menyimpan  data topik lomba."
          );
        } else {
          SweetAlert("Sukses", "Data topik berhasil disimpan", "success");
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
            Tambah Data Topik Baru
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="namaTopik"
                  label="Nama Topik Lomba"
                  isRequired
                  value={formDataRef.current.namaTopik}
                  onChange={handleInputChange}
                  errorMessage={errors.namaTopik}
                />
              </div>
              {/* <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="Status"
                  label="Status"
                  value={formDataRef.current.Status}
                  onChange={handleInputChange}
                  errorMessage={errors.Status}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="top_created_by"
                  label="Dibuat Oleh"
                  value={formDataRef.current.top_created_by}
                  onChange={handleInputChange}
                  errorMessage={errors.top_created_by}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="top_created_date"
                  label="Tanggal Dibuat"
                  value={formDataRef.current.top_created_date}
                  onChange={handleInputChange}
                  errorMessage={errors.top_created_date}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="top_modif_by"
                  label="Terakhir Diubah Oleh"
                  value={formDataRef.current.top_modif_by}
                  onChange={handleInputChange}
                  errorMessage={errors.top_modif_by}
                />
              </div>
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="top_modif_date"
                  label="Tanggal Terakhir Diubah"
                  value={formDataRef.current.top_modif_date}
                  onChange={handleInputChange}
                  errorMessage={errors.top_modif_date}
                />
              </div> */}
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
