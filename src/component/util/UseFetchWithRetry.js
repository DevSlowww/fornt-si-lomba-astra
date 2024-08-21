import Cookies from "js-cookie";
import { decryptId } from "./Encryptor";
import axios from "axios";

const UseFetch = async (
  url,
  param = {},
  retries = 10,
  delay = 5000
) => {
  try {
    let activeUser = "";

    // Get the activeUser cookie and decrypt it
    const cookie = Cookies.get("activeUser");
    if (cookie) {
      try {
        activeUser = JSON.parse(decryptId(cookie)).username;
      } catch (error) {
        console.error("Error decrypting cookie: ", error);
        throw new Error("Error decrypting cookie");
      }
    }

    // Prepare the parameters to be sent with the request
    const paramToSend = {
      ...param,
      activeUser: activeUser || undefined,
    };

    console.log("Fetching data with URL:", url);
    console.log("Parameters:", paramToSend);

    let lastError = null;

    // Attempt to fetch with retries
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Send the POST request using Axios
        const response = await axios.post(url, paramToSend, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if the response is okay
        if (response.status !== 200) {
          console.error("Server returned an error: ", response.statusText);
          lastError = new Error(response.statusText || "Fetch error");
          continue; // Retry if response is not okay
        }

        // Return the response data
        console.log("Data received:", response.data);
        return response.data;
      } catch (error) {
        console.error("Fetch attempt failed:", error);
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, delay)); // Delay before retrying
      }
    }

    // If all retries fail, throw the last error
    throw lastError;
  } catch (error) {
    console.error("Fetch Error: ", error);
    throw error;
  }
};

export default UseFetch;
