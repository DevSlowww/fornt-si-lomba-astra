import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import UseFetchWithRetry from "../../util/UseFetchWithRetry";
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

const listHasilLomba = [
  { Value: "Juara 1", Text: "Juara 1" },
  { Value: "Juara 2", Text: "Juara 2" },
  { Value: "Juara 3", Text: "Juara 3" },
  { Value: "Juara Harapan", Text: "Juara Harapan" },
  { Value: "Peserta", Text: "Peserta" },
  { Value: "Lainnya", Text: "Lainnya" },
];

export default function HistoriLombaReport({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [lomba, setLomba] = useState([]);
  const [selectedHasilLomba, setSelectedHasilLomba] = useState("");

  const fileDokumentasi = useRef(null);
  const fileSertifikat = useRef(null);

  const formDataRef = useRef({
    pdft_id: withID,
    lmb_id: "",
    pmb_id: "",
    mhs_id: JSON.parse(decryptId(Cookies.get("activeUser"))).username,
    pen_tanggal: "",
    pen_hasil: "",
    pen_dokumentasi: "",
    pen_sertifikat: "",
    pen_status: "",
  });

  const uploadFile = async (fileRef) => {
    const file = fileRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch(`${API_LINK}Utilities/Upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) throw new Error("Failed to upload file");

    return await uploadResponse.text();
  };

  const handleFileChange = async (ref, extAllowed, inputName) => {
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop().toLowerCase();
    let error = "";

    if (fileSize / 1024 / 1024 > 10) error = "Berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "Format berkas tidak valid";

    if (error) ref.current.value = "";
    else {
      formDataRef.current[inputName] = fileName;
      handleInputChange({ target: { name: inputName, value: fileName } });
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [inputName]: error,
    }));
  };

  const userSchema = object({
    pen_hasil: string().required("data tidak boleh kosong"),
    pen_dokumentasi: string().required("data tidak boleh kosong"),
    pen_sertifikat: string().required("data tidak boleh kosong"),
    pen_lainnya: string(),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsError((prevError) => ({ ...prevError, error: false }));

      try {
        const data = await UseFetchWithRetry(
          API_LINK + "MasterLomba/GetNamaLombaByPDFTId",
          { id: withID }
        );
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar.");
        } else {
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
    if (name === "pen_hasil") setSelectedHasilLomba(value);

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
  
    // Log validation errors for debugging
    console.log("Validation Errors:", validationErrors);
  
    if (validationErrors) {
      console.log("Validation errors found, setting errors.");
      setErrors(validationErrors);
      return; // Stop execution if there are validation errors
    }
  
    // Handle file uploads
    if (fileDokumentasi.current.files.length > 0) {
      const uploadedDokumentasi = await uploadFile(fileDokumentasi);
      const uploadResponseJson = JSON.parse(uploadedDokumentasi);
      formDataRef.current.pen_dokumentasi = uploadResponseJson.newFileName;
    }
  
    if (fileSertifikat.current.files.length > 0) {
      const uploadedSertifikat = await uploadFile(fileSertifikat);
      const uploadResponseJson = JSON.parse(uploadedSertifikat);
      formDataRef.current.pen_sertifikat = uploadResponseJson.newFileName;
    }
  
    // Save "Lainnya" value to pen_hasil if selected
    if (formDataRef.current.pen_hasil === "Lainnya") {
      formDataRef.current.pen_hasil = formDataRef.current.pen_lainnya;
    }
  
    setIsLoading(true);
    setIsError((prevError) => ({ ...prevError, error: false }));
    setErrors({});
  
    try {
      const data = await UseFetch(
        API_LINK + "TrPendaftaran/EditTrPendaftaran",
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
            Laporan Hasil Lomba
          </div>
          <div className="card-body p-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="card">
                  <div className="card-header bg-light fw-bold">
                    Tambah Data Laporan Untuk Lomba {lomba.Nama}
                  </div>
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-lg-4">
                        <DropDown
                          forInput="pen_hasil"
                          label="Hasil Lomba"
                          isRequired
                          arrData={listHasilLomba}
                          value={formDataRef.current.pen_hasil}
                          onChange={handleInputChange}
                          errorMessage={errors.pen_hasil}
                        />
                      </div>
                      {selectedHasilLomba === "Lainnya" && (
                        <div className="col-lg-4">
                          <Input
                            type="text"
                            forInput="pen_lainnya"
                            label="Lainnya"
                            isRequired
                            value={formDataRef.current.pen_lainnya}
                            onChange={handleInputChange}
                            errorMessage={errors.pen_lainnya}
                          />
                        </div>
                      )}
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="pen_dokumentasi"
                          label="Dokumentasi Lomba (.jpg, .png)"
                          formatFile=".jpg,.png"
                          ref={fileDokumentasi}
                          onChange={() =>
                            handleFileChange(
                              fileDokumentasi,
                              "jpg,png",
                              "pen_dokumentasi"
                            )
                          }
                          errorMessage={errors.pen_dokumentasi}
                          isRequired
                        />
                      </div>
                      <div className="col-lg-4">
                        <FileUpload
                          forInput="pen_sertifikat"
                          label="Sertifikat Lomba (.jpg, .png, .pdf)"
                          formatFile=".jpg,.png,.pdf"
                          ref={fileSertifikat}
                          onChange={() =>
                            handleFileChange(
                              fileSertifikat,
                              "jpg,png,pdf",
                              "pen_sertifikat"
                            )
                          }
                          errorMessage={errors.pen_sertifikat}
                          isRequired
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




// import { useEffect, useRef, useState } from "react";
// import { object, string } from "yup";
// import SweetAlert from "../../util/SweetAlert";
// import UseFetch from "../../util/UseFetch";
// import UseFetchWithRetry from "../../util/UseFetchWithRetry";
// import Button from "../../part/Button";
// import DropDown from "../../part/Dropdown";
// import Input from "../../part/Input";
// import FileUpload from "../../part/FileUpload";
// import Loading from "../../part/Loading";
// import Alert from "../../part/Alert";
// import { API_LINK } from "../../util/Constants";
// import { validateAllInputs, validateInput } from "../../util/ValidateForm";
// import Cookies from "js-cookie";
// import { decryptId } from "../../util/Encryptor";

// const listHasilPendaftaran = [
//   { Value: 1, Text: "SETUJUI" },
//   { Value: 2, Text: "TIDAK SETUJUI" },
// ];

// const listHasilLomba = [
//   { Value: "Juara 1", Text: "Juara 1" },
//   { Value: "Juara 2", Text: "Juara 2" },
//   { Value: "Juara 3", Text: "Juara 3" },
//   { value: "Peserta ", Text : "Peserta"},
//   { Value: "Juara Harapan", Text: "Juara Harapan" },
//   { Value: "Lainnya", Text: "Lainnya" },
// ];

// export default function HistoriLombaReport({ onChangePage, withID }) {
//   const [errors, setErrors] = useState({});
//   const [isError, setIsError] = useState({ error: false, message: "" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [lomba, setLomba] = useState([]);
//   const [selectedHasilLomba, setSelectedHasilLomba] = useState("");

//   const fileDokumentasi = useRef(null);
//   const fileSertifikat = useRef(null);

//   const formDataRef = useRef({
//     pdft_id: withID,
//     lmb_id: "",
//     pmb_id: "",
//     mhs_id: JSON.parse(decryptId(Cookies.get("activeUser"))).username,
//     pen_tanggal: "",
//     pen_hasil: "",
//     pen_dokumentasi: "",
//     pen_sertifikat: "",
//     pen_status: "",
//   });

//   const uploadFile = async (fileRef) => {
//     const file = fileRef.current.files[0];
//     const formData = new FormData();
//     formData.append("file", file);

//     const uploadResponse = await fetch(`${API_LINK}Utilities/Upload`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!uploadResponse.ok) throw new Error("Failed to upload file");

//     return await uploadResponse.text();
//   };

//   const handleFileChange = async (ref, extAllowed, inputName) => {
//     const file = ref.current.files[0];
//     const fileName = file.name;
//     const fileSize = file.size;
//     const fileExt = fileName.split(".").pop().toLowerCase();
//     let error = "";

//     if (fileSize / 1024 / 1024 > 10) error = "Berkas terlalu besar";
//     else if (!extAllowed.split(",").includes(fileExt))
//       error = "Format berkas tidak valid";

//     if (error) ref.current.value = "";
//     else {
//       formDataRef.current[inputName] = fileName;
//       handleInputChange({ target: { name: inputName, value: fileName } });
//     }

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [inputName]: error,
//     }));
//   };

//   const userSchema = object({
//     pen_hasil: string().required("tidak boleh kosong"),
//     pen_dokumentasi: string().required("tidak boleh kosong"),
//     pen_sertifikat: string().required("tidak boleh kosong"),
//     pen_lainnya: string(),
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsError((prevError) => ({ ...prevError, error: false }));

//       try {
//         const data = await UseFetchWithRetry(
//           API_LINK + "MasterLomba/GetNamaLombaByPDFTId",
//           { id: withID }
//         );
//         if (data === "ERROR") {
//           throw new Error("Terjadi kesalahan: Gagal mengambil daftar.");
//         } else {
//           setLomba(data[0]);
//         }
//       } catch (error) {
//         setIsError((prevError) => ({
//           ...prevError,
//           error: true,
//           message: error.message,
//         }));
//         setLomba({});
//       }
//     };

//     fetchData();
//   }, [withID]);

//   const handleInputChange = async (e) => {
//     const { name, value } = e.target;
//     const validationError = await validateInput(name, value, userSchema);
//     formDataRef.current[name] = value;
//     if (name === "pen_hasil") setSelectedHasilLomba(value);

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [validationError.name]: validationError.error,
//     }));
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();

//     const validationErrors = await validateAllInputs(
//       formDataRef.current,
//       userSchema,
//       setErrors
//     );

//     // Handle file uploads
//     if (fileDokumentasi.current.files.length > 0) {
//       const uploadedDokumentasi = await uploadFile(fileDokumentasi);
//       const uploadResponseJson = JSON.parse(uploadedDokumentasi);
//       formDataRef.current.pen_dokumentasi = uploadResponseJson.newFileName;
//     }

//     if (fileSertifikat.current.files.length > 0) {
//       const uploadedSertifikat = await uploadFile(fileSertifikat);
//       const uploadResponseJson = JSON.parse(uploadedSertifikat);
//       formDataRef.current.pen_sertifikat = uploadResponseJson.newFileName;
//     }

//     // Save "Lainnya" value to pen_hasil if selected
//     if (formDataRef.current.pen_hasil === "Lainnya") {
//       formDataRef.current.pen_hasil = formDataRef.current.pen_lainnya;
//     }

//     setIsLoading(true);
//     setIsError((prevError) => ({ ...prevError, error: false }));
//     setErrors({});

//     try {
//       const data = await UseFetch(
//         API_LINK + "TrPendaftaran/EditTrPendaftaran",
//         formDataRef.current
//       );

//       if (data === "ERROR") {
//         throw new Error("Terjadi kesalahan: Gagal menyimpan data Pendaftaran.");
//       } else {
//         SweetAlert("Sukses", "Data Pendaftaran berhasil disimpan", "success");
//         onChangePage("index");
//       }
//     } catch (error) {
//       setIsError((prevError) => ({
//         ...prevError,
//         error: true,
//         message: error.message,
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) return <Loading />;

//   return (
//     <>
//       {isError.error && (
//         <div className="flex-fill">
//           <Alert type="danger" message={isError.message} />
//         </div>
//       )}
//       <form onSubmit={handleAdd}>
//         <div className="card">
//           <div className="card-header bg-primary fw-medium text-white">
//             Laporan Hasil Lomba
//           </div>
//           <div className="card-body p-3">
//             <div className="row">
//               <div className="col-lg-12">
//                 <div className="card">
//                   <div className="card-header bg-light fw-bold">
//                     Tambah Data Laporan Untuk Lomba {lomba.Nama}
//                   </div>
//                   <div className="card-body p-4">
//                     <div className="row">
//                       <div className="col-lg-4">
//                         <DropDown
//                           forInput="pen_hasil"
//                           label="Hasil Lomba"
//                           isRequired
//                           arrData={listHasilLomba}
//                           value={formDataRef.current.pen_hasil}
//                           onChange={handleInputChange}
//                           errorMessage={errors.pen_hasil}
//                         />
//                       </div>
//                       {selectedHasilLomba === "Lainnya" && (
//                         <div className="col-lg-4">
//                           <Input
//                             type="text"
//                             forInput="pen_lainnya"
//                             label="Lainnya"
//                             isRequired
//                             value={formDataRef.current.pen_lainnya}
//                             onChange={handleInputChange}
//                             errorMessage={errors.pen_lainnya}
//                           />
//                         </div>
//                       )}
//                       <div className="col-lg-4">
//                         <FileUpload
//                           forInput="pen_dokumentasi"
//                           label="Dokumentasi Lomba (.jpg, .png)"
//                           formatFile=".jpg,.png"
//                           ref={fileDokumentasi}
//                           onChange={() =>
//                             handleFileChange(
//                               fileDokumentasi,
//                               "jpg,png",
//                               "pen_dokumentasi"
//                             )
//                           }
//                           errorMessage={errors.pen_dokumentasi}
//                           isRequired
//                         />
//                       </div>
//                       <div className="col-lg-4">
//                         <FileUpload
//                           forInput="pen_sertifikat"
//                           label="Sertifikat Lomba (.jpg, .png, .pdf)"
//                           formatFile=".jpg,.png,.pdf"
//                           ref={fileSertifikat}
//                           onChange={() =>
//                             handleFileChange(
//                               fileSertifikat,
//                               "jpg,png,pdf",
//                               "pen_sertifikat"
//                             )
//                           }
//                           errorMessage={errors.pen_sertifikat}
//                           isRequired
//                         />
//                       </div>
//                     </div>
//                     <div className="float-end my-4 mx-1">
//                       <Button
//                         classType="secondary me-2 px-4 py-2"
//                         label="BATAL"
//                         onClick={() => onChangePage("index")}
//                       />
//                       <Button
//                         classType="primary ms-2 px-4 py-2"
//                         type="submit"
//                         label="SIMPAN"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </form>
//     </>
//   );
// }







// import { useEffect, useRef, useState } from "react";
// import { object, string } from "yup";
// import SweetAlert from "../../util/SweetAlert";
// import UseFetch from "../../util/UseFetch";
// import Button from "../../part/Button";
// import DropDown from "../../part/Dropdown";
// import Input from "../../part/Input";
// import FileUpload from "../../part/FileUpload";
// import Loading from "../../part/Loading";
// import Alert from "../../part/Alert";
// import { API_LINK } from "../../util/Constants";
// import { validateAllInputs, validateInput } from "../../util/ValidateForm";
// import Cookies from "js-cookie";
// import { decryptId } from "../../util/Encryptor";
// const listHasilPendaftaran = [
//   { Value: 1, Text: "SETUJUI" },
//   { Value: 2, Text: "TIDAK SETUJUI" },
// ];

// const listHasilLomba = [
//   { Value: "Juara 1", Text: "Juara 1" },
//   { Value: "Juara 2", Text: "Juara 2" },
//   { Value: "Juara 3", Text: "Juara 3" },
//   { Value: "Juara Harapan", Text: "Juara Harapan" },
//   { Value: "Peserta Lomba", Text: "Peserta Lomba" },
//   { Value: "Lainnya", Text: "Lainnya" },
// ];


// export default function HistoriLombaReport({ onChangePage, withID }) {
//   const [errors, setErrors] = useState({});
//   const [isError, setIsError] = useState({ error: false, message: "" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [lomba, setLomba] = useState([]);
//   const [selectedHasilLomba, setSelectedHasilLomba] = useState("");
//   const fileDokumentasi = useRef(null);
//   const fileSertifikat = useRef(null);

//   const formDataRef = useRef({
//     pdft_id: withID,
//     lmb_id: "",
//     pmb_id: "",
//     mhs_id: JSON.parse(decryptId(Cookies.get("activeUser"))).username,
//     pen_tanggal: "",
//     pen_hasil: "",
//     pen_dokumentasi: "",
//     pen_sertifikat: "",
//     pen_status: "",
//   });

//   const uploadFile = async (fileRef) => {
//     const file = fileRef.current.files[0];
//     const formData = new FormData();
//     formData.append("file", file);

//     const uploadResponse = await fetch(`${API_LINK}Utilities/Upload`, {
//       method: "POST",
//       body: formData,
//     });

//     if (!uploadResponse.ok) throw new Error("Failed to upload file");

//     return await uploadResponse.text();
//   };

//   const handleFileChange = async (ref, extAllowed, inputName) => {
//     const file = ref.current.files[0];
//     const fileName = file.name;
//     const fileSize = file.size;
//     const fileExt = fileName.split(".").pop().toLowerCase();
//     let error = "";

//     if (fileSize / 1024 / 1024 > 10) error = "Berkas terlalu besar";
//     else if (!extAllowed.split(",").includes(fileExt))
//       error = "Format berkas tidak valid";

//     if (error) ref.current.value = "";
//     else {
//       formDataRef.current[inputName] = fileName;
//       handleInputChange({ target: { name: inputName, value: fileName } });
//     }

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [inputName]: error,
//     }));
//   };
//   const userSchema = object({
//     pen_hasil: string().required("tidak boleh kosong"),
//     pen_dokumentasi: string().required("tidak boleh kosong"),
//     pen_sertifikat: string().required("tidak boleh kosong"),
//     pen_lainnya: string(),
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsError((prevError) => ({ ...prevError, error: false }));

//       try {
//         const data = await UseFetch(
//           API_LINK + "MasterLomba/GetNamaLombaByPDFTId",
//           { id: withID }
//         );
//         if (data === "ERROR") {
//           throw new Error("Terjadi kesalahan: Gagal mengambil daftar.");
//         } else {
//           setLomba(data[0]);
//         }
//       } catch (error) {
//         setIsError((prevError) => ({
//           ...prevError,
//           error: true,
//           message: error.message,
//         }));
//         setLomba({});
//       }
//     };

//     fetchData();
//   }, []);

//   const handleInputChange = async (e) => {
//     const { name, value } = e.target;
//     const validationError = await validateInput(name, value, userSchema);
//     formDataRef.current[name] = value;
//     if (name === "pen_hasil") setSelectedHasilLomba(value);

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [validationError.name]: validationError.error,
//     }));
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();

//     const validationErrors = await validateAllInputs(
//       formDataRef.current,
//       userSchema,
//       setErrors
//     );
//     let uploadedFileName = "";

//     if (fileDokumentasi.current.files.length > 0) {
//       const uploadedDokumentasi = await uploadFile(fileDokumentasi);
//       console.log(uploadedDokumentasi);
//       const uploadResponseJson = JSON.parse(uploadedDokumentasi);
//       const newFileName = uploadResponseJson.newFileName;
//       formDataRef.current.posterLomba = newFileName;
//       formDataRef.current.pen_dokumentasi = newFileName;
//     }

//     // Mengunggah file sertifikat jika ada
//     if (fileSertifikat.current.files.length > 0) {
//       const uploadedSertifikat = await uploadFile(fileSertifikat);
//       console.log(uploadedSertifikat);
//       const uploadResponseJson = JSON.parse(uploadedSertifikat);
//       const newFileName = uploadResponseJson.newFileName;
//       formDataRef.current.posterLomba = newFileName;
//       formDataRef.current.pen_sertifikat = newFileName;
//     }

//     if (fileSertifikat.current.files.length > 0) {
//       const uploadedSertifikat = await uploadFile(fileSertifikat);
//       const uploadResponseJson = JSON.parse(uploadedSertifikat);
//       formDataRef.current.pen_sertifikat = uploadResponseJson.newFileName;
//     }

//     // Save "Lainnya" value to pen_hasil if selected
//     if (formDataRef.current.pen_hasil === "Lainnya") {
//       formDataRef.current.pen_hasil = formDataRef.current.pen_lainnya;
//     }

//     setIsLoading(true);
//     setIsError((prevError) => ({ ...prevError, error: false }));
//     setErrors({});

//     try {
//       const data = await UseFetch(
//         API_LINK + "TrPendaftaran/EditTrPendaftaran",
//         formDataRef.current
//       );

//       if (data === "ERROR") {
//         throw new Error("Terjadi kesalahan: Gagal menyimpan data Pendaftaran.");
//       } else {
//         SweetAlert("Sukses", "Data Pendaftaran berhasil disimpan", "success");
//         onChangePage("index");
//       }
//     } catch (error) {
//       setIsError((prevError) => ({
//         ...prevError,
//         error: true,
//         message: error.message,
//       }));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) return <Loading />;

//   return (
//     <>
//       {isError.error && (
//         <div className="flex-fill">
//           <Alert type="danger" message={isError.message} />
//         </div>
//       )}
//       <form onSubmit={handleAdd}>
//         <div className="card">
//           <div className="card-header bg-primary fw-medium text-white">
//             Laporan Hasil Lomba
//           </div>
//           <div className="card-body p-3">
//             <div className="row">
//               <div className="col-lg-12">
//                 <div className="card">
//                   <div className="card-header bg-light fw-bold">
//                     Tambah Data Laporan Untuk Lomba {lomba.Nama}
//                   </div>
//                   <div className="card-body p-4">
//                     <div className="row">
//                       <div className="col-lg-4">
//                         <DropDown
//                           type="text"
//                           forInput="pen_hasil"
//                           label="Hasil Lomba"
//                           isRequired
//                           value={formDataRef.current.pen_hasil}
//                           onChange={handleInputChange}
//                           errorMessage={errors.pen_hasil}
//                         />
//                       </div>
//                       {selectedHasilLomba === "Lainnya" && (
//                         <div className="col-lg-4">
//                           <Input
//                             type="text"
//                             forInput="pen_lainnya"
//                             label="Lainnya"
//                             isRequired
//                             value={formDataRef.current.pen_lainnya}
//                             onChange={handleInputChange}
//                             errorMessage={errors.pen_lainnya}
//                           />
//                         </div>
//                       )}
//                       </div>
//                       <div className="col-lg-4">
//                         <FileUpload
//                           forInput="pen_dokumentasi"
//                           label="Dokumentasi Lomba (.jpg, .png)"
//                           formatFile=".jpg,.png"
//                           ref={fileDokumentasi}
//                           onChange={() =>
//                             handleFileChange(
//                               fileDokumentasi,
//                               "jpg,png",
//                               "pen_dokumentasi"
//                             )
//                           }
//                           errorMessage={errors.pen_dokumentasi}
//                           isRequired
//                         />
//                       </div>
//                       <div className="col-lg-4">
//                         <FileUpload
//                           forInput="pen_sertifikat"
//                           label="Sertifikat Lomba (.jpg, .png, .pdf)"
//                           formatFile=".jpg,.png,.pdf"
//                           ref={fileSertifikat}
//                           onChange={() =>
//                             handleFileChange(
//                               fileSertifikat,
//                               "jpg,png,pdf",
//                               "pen_sertifikat"
//                             )
//                           }
//                           errorMessage={errors.pen_sertifikat}
//                           isRequired
//                         />
//                       </div>
//                     </div>
//                     <div className="float-end my-4 mx-1">
//                       <Button
//                         classType="secondary me-2 px-4 py-2"
//                         label="BATAL"
//                         onClick={() => onChangePage("index")}
//                       />
//                       <Button
//                         classType="primary ms-2 px-4 py-2"
//                         type="submit"
//                         label="SIMPAN"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         {/* </div> */}
//       </form>
//     </>
//   );
// }