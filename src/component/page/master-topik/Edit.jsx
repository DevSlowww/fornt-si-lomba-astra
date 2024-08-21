import { useEffect, useRef, useState } from "react";
// import { object, string } from "yup";
import { object, string, date } from "yup"; // Import date dari Yup
import { API_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Label from "../../part/Label";
import Input from "../../part/Input";
import Loading from "../../part/Loading";
import Alert from "../../part/Alert";

// import { object, string } from "yup"; // Impor fungsi yang diperlukan dari Yup

// const listJenisTopik= [
//   { Value: "Part", Text: "Part" },
//   { Value: "Unit", Text: "Unit" },
//   { Value: "Konstruksi", Text: "Konstruksi" },
//   { Value: "Mass Production", Text: "Mass Production" },
//   { Value: "Lainnya", Text: "Lainnya" },
// ];

// // Definisikan skema validasi menggunakan Yup
// const userSchema = object({
//   idTopik: string(),
//   namaTopik: string().required("Nama Topik harus diisi"), // Validasi untuk bidang namaTopik
//   statusTopik: string(), // Validasi untuk bidang statusTopik
//   createdBy: string(), // Validasi untuk bidang createdBy
//   createdDate: string(), // Validasi untuk bidang createdDate
//  a modifiedBy: string(), // Validasi untuk bidang modifiedBy
//   modifiedDate: string(), // Validasi untuk bidang modifiedDate
// });

const userSchema = object({
  idTopik: string(),
  namaTopik: string().required("Nama Topik harus diisi"),
  statusTopik: string(),
  createdBy: string(),
  createdDate: string(),
  modifiedBy: string().required("modifiedBy cannot be null"),
  modifiedDate: date().required("modifiedDate cannot be null"),
});

export default function MasterTopikEdit({ onChangePage, withID }) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);

  const formDataRef = useRef({
    idTopik: "",
    namaTopik: "",
  });

  // const userSchema = object({
  //   idTopik: string(),
  //   namaTopik: string()
  // });

  useEffect(() => {
    const fetchData = async () => {
      // setIsError((prevError) => ({ ...prevError, error: false }));

      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(
          API_LINK + "MasterTopik/GetDataTopikById",
          {
            id: withID,
          }
        );

        if (data === "ERROR" || data.length === 0) {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Topik.");
        } else {
          formDataRef.current = { ...formDataRef.current, ...data[0] };
        }
      } catch (error) {
        // setIsError((prevError) => ({
        //   ...prevError,
        //   error: true,
        //   message: error.message,
        // }));
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [withID]);
  // }, []);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    // setErrors((prevErrors) => ({
    //   ...prevErrors,
    //   [validationError.name]: validationError.error,
    // }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  // const handleAdd = async (e) => {
  //   e.preventDefault();

  //   const validationErrors = await validateAllInputs(
  //     formDataRef.current,
  //     userSchema,
  //     setErrors
  //   );

  //   // error nya disini, ga jalan
  //   if (Object.values(validationErrors).every((error) => !error)) {

  //     // console.log("bang aziz 3")
  //     setIsLoading(true);
  //     // setIsError((prevError) => ({ ...prevError, error: false }));
  //     // setErrors({});
  //     setIsError({ error: false, message: "" });

  //     const uploadPromises = []; // Tambahkan ini jika diperlukan

  //     try {
  //       // await Promise.all(uploadPromises);

  //       const data = await UseFetch(
  //         API_LINK + "MasterTopik/EditTopik",
  //         formDataRef.current
  //       );

  //       if (data === "ERROR") {
  //         throw new Error("Terjadi kesalahan: Gagal menyimpan data topik.");
  //       } else {
  //         SweetAlert("Sukses", "Data Topik berhasil disimpan", "success");
  //         onChangePage("index");
  //       }
  //     } catch (error) {
  //       setIsError((prevError) => ({
  //         ...prevError,
  //         error: true,
  //         message: error.message,
  //       }));
  //       setIsError({ error: true, message: error.message });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  // const handleAdd = async (e) => {
  //   e.preventDefault();

  //   // Set modifiedBy dan modifiedDate sebelum validasi dan pengiriman data
  //   formDataRef.current.modifiedBy = "currentUser"; // Ganti dengan nilai dari pengguna yang login
  //   formDataRef.current.modifiedDate = new Date().toISOString();

  //   const validationErrors = await validateAllInputs(
  //     formDataRef.current,
  //     userSchema,
  //     setErrors
  //   );

  //   if (isError) {
  //     return
  //   }

  //   try {
  //     const data = await UseFetch(
  //       API_LINK + "MasterTopik/EditTopik",
  //       formDataRef.current
  //     );

  //     if (data === "ERROR") {
  //       throw new Error("Terjadi kesalahan: Gagal menyimpan data topik.");
  //     } else {
  //       SweetAlert("Sukses", "Data Topik berhasil disimpan untuk Update", "success");
  //       onChangePage("index");
  //     }
  //   } catch (error) {
  //     setIsError({ error: true, message: error.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleAdd = async (e) => {
  //   e.preventDefault(); // Hentikan perilaku default dari form submission

  //   // Set modifiedBy dan modifiedDate sebelum validasi dan pengiriman data
  //   formDataRef.current.modifiedBy = "currentUser"; // Ganti dengan nilai dari pengguna yang login
  //   formDataRef.current.modifiedDate = new Date().toISOString();

  //   // Lakukan validasi sebelum pengiriman data
  //   const validationErrors = await validateAllInputs(
  //     formDataRef.current,
  //     userSchema,
  //     setErrors
  //   );

  //   // Periksa apakah ada kesalahan validasi
  //   if (Object.values(validationErrors).some(error => error)) {
  //     return; // Hentikan proses pengiriman data jika ada kesalahan validasi
  //   }

  //   setIsLoading(true); // Tandai bahwa aplikasi sedang memuat

  //   try {
  //     // Kirim data ke server untuk disimpan
  //     const data = await UseFetch(
  //       API_LINK + "MasterTopik/EditTopik",
  //       formDataRef.current
  //     );

  //     if (data === "ERROR") {
  //       // Tampilkan pesan kesalahan jika terjadi kesalahan saat menyimpan data
  //       throw new Error("Terjadi kesalahan: Gagal menyimpan data topik.");
  //     } else {
  //       // Tampilkan pesan sukses jika data berhasil disimpan
  //       SweetAlert("Sukses", "Data Topik berhasil disimpan untuk Update", "success");
  //       onChangePage("index"); // Redirect pengguna ke halaman indeks
  //     }
  //   } catch (error) {
  //     // Tangani kesalahan yang terjadi saat pengiriman data ke server
  //     setIsError({ error: true, message: error.message });
  //   } finally {
  //     setIsLoading(false); // Hentikan indikator loading setelah proses selesai
  //   }
  // };

  // const handleAdd = async (e) => {
  //   e.preventDefault();

  //   // Set modifiedBy dan modifiedDate sebelum validasi dan pengiriman data
  //   formDataRef.current.modifiedBy = "currentUser"; // Ganti dengan nilai dari pengguna yang login
  //   formDataRef.current.modifiedDate = new Date().toISOString();

  //   const validationErrors = await validateAllInputs(
  //     formDataRef.current,
  //     userSchema,
  //     setErrors
  //   );

  //   // Periksa apakah ada kesalahan validasi
  //   if (Object.values(validationErrors).some((error) => error)) {
  //     return;
  //   }

  //   try {
  //     const data = await UseFetch(
  //       API_LINK + "MasterTopik/EditTopik",
  //       formDataRef.current
  //     );

  //     // Periksa respons dari server
  //     if (data === "ERROR") {
  //       throw new Error("Terjadi kesalahan: Gagal menyimpan data topik.");
  //     } else {
  //       // Update data lokal jika respons berhasil
  //       formDataRef.current = { ...formDataRef.current, ...data };
  //       SweetAlert("Sukses", "Data Topik berhasil disimpan untuk Update", "success");
  //       onChangePage("index");
  //     }
  //   } catch (error) {
  //     setIsError({ error: true, message: error.message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Set modifiedBy dan modifiedDate sebelum validasi dan pengiriman data
    formDataRef.current.modifiedBy = "currentUser"; // Ganti dengan nilai dari pengguna yang login
    formDataRef.current.modifiedDate = new Date().toISOString();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    // Jika ada error validasi, hentikan proses penyimpanan data
    if (Object.values(validationErrors).some((error) => error)) {
      return;
    }

    setIsLoading(true); // Aktifkan indikator loading

    try {
      // Kirim permintaan penyimpanan data ke server
      const data = await UseFetch(
        API_LINK + "MasterTopik/EditTopik",
        formDataRef.current
      );

      // Periksa respons dari server
      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal menyimpan data topik.");
      } else {
        // Tampilkan pesan sukses
        SweetAlert(
          "Sukses",
          "Data Topik berhasil disimpan untuk Update",
          "success"
        );
        // Kembalikan ke halaman indeks setelah penyimpanan berhasil
        onChangePage("index");
      }
    } catch (error) {
      // Tangani kesalahan yang mungkin terjadi saat penyimpanan data
      setIsError({ error: true, message: error.message });
    } finally {
      setIsLoading(false); // Matikan indikator loading
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
            Ubah Data Topik
          </div>
          <div className="card-body p-4">
            <div className="row">
              <div className="col-lg-4">
                <Input
                  type="text"
                  forInput="namaTopik"
                  label="Nama Topik"
                  isRequired
                  value={formDataRef.current.namaTopik}
                  onChange={handleInputChange}
                  errorMessage={errors.namaTopik}
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
