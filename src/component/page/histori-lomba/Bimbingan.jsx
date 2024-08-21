import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import DropDown from "../../part/Dropdown";
import Input from "../../part/Input";
import FileUpload from "../../part/FileUpload";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
const listHasilPendaftaran = [
  { Value: 1, Text: "SETUJUI" },
  { Value: 2, Text: "TIDAK SETUJUI" },
];

export default function HistoriLombaBimbingan({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [lomba, setLomba] = useState("");

  const formDataRef = useRef({
    penId: withID,
    topik: "",
    tanggal: "",
    catatan: "",
  });

  const userSchema = object({
    tanggal: string().required("harus diisi"),
    // topik: string().required("harus diisi"),
    topik: string().max(100, "maksimum 100 karakter").required("harus diisi"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterLomba/GetNamaLombaByPDFTId",
          { id: withID }
        );

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar.");
        } else {
          console.log("INI" + withID);
          setLomba(data[0]);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setLomba({});
      }
    };

    fetchData();
  }, [withID]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const convertToCustomFormat = (dateTime) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

      
    if (validationErrors) {
      console.log("Validation errors found:", validationErrors); // Log untuk debug
      setErrors(validationErrors);
      return; // Hentikan eksekusi jika ada kesalahan validasi
    }

    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});

    formDataRef.current.tanggal = convertToCustomFormat(
      formDataRef.current.tanggal
    );

    try {
      const data = await UseFetch(
        API_LINK + "Bimbingan/CreateBimbingan",
        formDataRef.current
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data Bimbingan.");
      } else {
        SweetAlert("Sukses", "Data Bimbingan berhasil disimpan", "success");
        onChangePage("detail", withID);
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

    // Fungsi validateAllInputs
    const validateAllInputs = async (formData, schema, setErrors) => {
      try {
        await schema.validate(formData, { abortEarly: false });
        return null;
      } catch (err) {
        const validationErrors = err.inner.reduce((errors, currentError) => {
          return {
            ...errors,
            [currentError.path]: currentError.message,
          };
        }, {});
        return validationErrors;
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
            Ajukan Bimbingan
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-light fw-bold">
                    Ajukan Bimbingan Dengan {lomba.Pembimbing} Untuk Lomba{" "}
                    {lomba.Nama}
                  </div>

                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-6">
                        <Input
                          type="datetime-local"
                          forInput="tanggal"
                          label="Tanggal Bimbingan"
                          isRequired
                          value={formDataRef.current.tanggal}
                          onChange={handleInputChange}
                          errorMessage={errors.tanggal}
                        />
                      </div>
                      <div className="col-lg-6">
                        <Input
                          type="text"
                          forInput="topik"
                          label="Topik Bimbingan"
                          isRequired
                          value={formDataRef.current.topik}
                          onChange={handleInputChange}
                          errorMessage={errors.topik}
                        />
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
