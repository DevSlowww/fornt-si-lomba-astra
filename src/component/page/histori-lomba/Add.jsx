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

export default function HistoriLombaAdd({ onChangePage }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [lomba, setLomba] = useState([]);
  const [pembimbing, setPembimbing] = useState([]);

  const formDataRef = useRef({
    lmb_id: "",
    pmb_id: "",
    mhs_id: JSON.parse(decryptId(Cookies.get("activeUser"))).username,
    pen_tanggal: "",
    pen_alias: "",
    pen_hasil: "",
    pen_dokumentasi: "",
    pen_sertifikat: "",
  });

  const userSchema = object({
    lmb_id: string().required("harus dipilih"),
    pen_alias: string().required("harus diisi"),
    pmb_id: string().required("harus dipilih"),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetch(
          API_LINK + "MasterLomba/GetListLomba",
          {}
        );
        const dataPembimbing = await UseFetch(
          API_LINK + "Utilities/GetListPembimbing",
          {}
        );
        if (data === "ERROR" || dataPembimbing === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar.");
        } else {
          setLomba(data);
          setPembimbing(dataPembimbing);
        }
      } catch (error) {
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        setLomba({});
        setPembimbing({});
      }
    };

    fetchData();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    console.log("masuk");
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});

    try {
      const data = await UseFetch(
        API_LINK + "TrPendaftaran/CreatePendaftaran",
        formDataRef.current
      );

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data Pendaftaran.");
      } else {
        SweetAlert("Sukses", "Data Pendaftaran berhasil disimpan", "success");
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
            Daftar Lomba Baru
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-light fw-bold">
                    Tambahkan Pendaftaran Lomba Baru
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-4">
                        <DropDown
                          forInput="lmb_id"
                          label="Nama Lomba"
                          arrData={lomba}
                          isRequired
                          value={formDataRef.current.lmb_id}
                          onChange={handleInputChange}
                          errorMessage={errors.lmb_id}
                        />
                      </div>
                      <div className="col-lg-4">
                        <Input
                          type="text"
                          forInput="pen_alias"
                          label="Nama Tim"
                          isRequired
                          value={formDataRef.current.pen_alias}
                          onChange={handleInputChange}
                          errorMessage={errors.pen_alias}
                        />
                      </div>
                      <div className="col-lg-4">
                        <DropDown
                          forInput="pmb_id"
                          label="Pembimbing Lomba"
                          arrData={pembimbing}
                          isRequired
                          value={formDataRef.current.pmb_id}
                          onChange={handleInputChange}
                          errorMessage={errors.pmb_id}
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
