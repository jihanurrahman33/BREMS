import axios from "axios";

// Use the public gateway if no dedicated gateway is provided
const GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

export const uploadToIPFS = async (file) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const jwt = process.env.REACT_APP_PINATA_JWT;
    
    // If no JWT is provided, return a mock hash for testing purposes
    // This allows the app to function without credentials in development
    if (!jwt) {
      console.warn("No REACT_APP_PINATA_JWT found. using mock IPFS hash.");
      return "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"; // A placeholder image hash
    }

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload image to IPFS");
  }
};

export const getIPFSUrl = (ipfsHash) => {
  if (!ipfsHash) return null;
  return `${GATEWAY_URL}${ipfsHash}`;
};
