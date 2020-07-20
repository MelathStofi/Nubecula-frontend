import React, { useContext, useState } from "react";
import Dropzone from "./Dropzone";
import Progress from "./Progress";
import "./styles/UploadStyle.css";
import { FMContext } from "../../contexts/FMContext";

const Upload = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [successfullyUploaded, setSuccessfullyUploaded] = useState(false);
  const { setShowUpload } = useContext(FMContext);

  function onFilesAdded(files) {
    setUploadedFiles(uploadedFiles.concat(files));
  }

  const uploadFiles = async () => {
    setUploadProgress({});
    setUploading(true);
    const promises = [];
    uploadedFiles.forEach((file) => {
      promises.push(sendRequest(file));
    });
    try {
      await Promise.all(promises);

      setSuccessfullyUploaded(true);
      setUploading(false);
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      setSuccessfullyUploaded(true);
      setUploading(false);
    }
  };

  const sendRequest = (file) => {
    // const data = new FormData();
    // data.append("files", file);

    // axios({
    //   method: "post",
    //   url: process.env.REACT_APP_BASE_URL,
    //   data: data,
    //   withCredentials: true,
    // })
    //   .catch((error) => {
    //     //console.clear();
    //     console.log("You cannot upload file");
    //   })
    //   .then((resp) => {
    //     if (resp) {
    //       setFiles([...files, uploadFiles]);
    //       setUploadFiles([]);
    //     }
    //   });
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const copy = { ...uploadProgress };
          copy[file.name] = {
            state: "pending",
            percentage: (event.loaded / event.total) * 100,
          };
          setUploadProgress(copy);
        }
      });

      req.upload.addEventListener("load", (event) => {
        const copy = { ...uploadProgress };
        copy[file.name] = { state: "done", percentage: 100 };
        setUploadProgress(copy);
        resolve(req.response);
      });

      req.upload.addEventListener("error", (event) => {
        const copy = { ...uploadProgress };
        copy[file.name] = { state: "error", percentage: 0 };
        setUploadProgress(copy);
        reject(req.response);
      });

      const formData = new FormData();
      formData.append("files", file);
      console.log(formData.getAll("files"));
      req.open("POST", process.env.REACT_APP_BASE_URL);
      req.withCredentials = true;
      req.send(formData);
    });
  };

  const renderProgress = (file) => {
    const progress = uploadProgress[file.name];
    if (uploading || successfullyUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={progress ? progress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity: progress && progress.state === "done" ? 0.5 : 0,
            }}
          />
        </div>
      );
    }
  };

  const renderActions = () => {
    if (successfullyUploaded) {
      return (
        <button
          onClick={() => {
            setUploadedFiles([]);
            setSuccessfullyUploaded(false);
          }}
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={uploadedFiles.length < 0 || uploading}
          onClick={() => uploadFiles()}
        >
          Upload
        </button>
      );
    }
  };

  return (
    <div className="upload-card">
      <div className="Upload">
        <div className="Upload-header">
          <span className="Title">Upload Files</span>
          <span className="Close" onClick={() => setShowUpload(false)}>
            X
          </span>
        </div>
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={onFilesAdded}
              disabled={uploading || successfullyUploaded}
            />
          </div>
          <div className="Files">
            {uploadedFiles.map((file) => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename">{file.name}</span>
                  {renderProgress(file)}
                </div>
              );
            })}
          </div>
        </div>
        <div className="Actions">{renderActions()}</div>
      </div>
    </div>
  );
};

export default Upload;