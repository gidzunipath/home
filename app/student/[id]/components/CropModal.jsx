"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FaTimes, FaUpload } from "react-icons/fa";
import { supabase } from "../../../../lib/supabase";
import { useAppModal } from "../../../../hooks/useAppModal";

export default function CropModal({
  selectedImage,
  applicationId,
  uploading,
  setUploading,
  progress,
  setProgress,
  onUploadSuccess,
  onClose,
}) {
  const { showError } = useAppModal();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 200,
    height: 200,
    x: 50,
    y: 50,
  });
  const [completedCrop, setCompletedCrop] = useState(null);

  useEffect(() => {
    setCrop({ unit: "px", width: 200, height: 200, x: 50, y: 50 });
    setCompletedCrop(null);
  }, [selectedImage]);

  const getCroppedImg = (image, cropArea) =>
    new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;
      ctx.drawImage(
        image,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current || !selectedImage) return;

    setUploading(true);
    setProgress(0);

    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedFile = new File(
        [blob],
        `cropped-${selectedImage.name}`,
        { type: "image/jpeg" }
      );

      const filePath = `profile/${applicationId}-${Date.now()}-${croppedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, croppedFile, {
          cacheControl: "3600",
          upsert: true,
          onUploadProgress: (event) => {
            setProgress(Math.round((event.loaded / event.total) * 100));
          },
        });

      if (uploadError) throw uploadError;

      const { data: imageDetails } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      if (imageDetails.publicUrl) {
        onUploadSuccess(imageDetails.publicUrl);
      }

      const { data: existingPic, error: checkError } = await supabase
        .from("documents")
        .select("id")
        .eq("application_id", applicationId)
        .eq("name", "Profile Picture")
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingPic) {
        const { error: updateError } = await supabase
          .from("documents")
          .update({ url: imageDetails.publicUrl, upload_by: "Client" })
          .eq("id", existingPic.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("documents")
          .insert([
            {
              application_id: applicationId,
              name: "Profile Picture",
              upload_by: "Client",
              url: imageDetails.publicUrl,
            },
          ]);
        if (insertError) throw insertError;
      }

      setUploading(false);
      setProgress(0);
      onClose();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showError("Failed to upload image. Please try again.");
      setUploading(false);
    }
  };

  const handleCancel = () => {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => (input.value = ""));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      <div
        className="relative bg-white p-6 rounded-2xl shadow-large border border-appleGray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-appleGray-400 hover:text-appleGray-600 hover:bg-appleGray-100 rounded-full transition-all duration-200 z-10"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-appleGray-800 mb-1">
              Crop Your Profile Picture
            </h3>
            <p className="text-sm text-appleGray-500">
              Adjust the crop area to select the part of your image you want
              to use
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={50}
                minHeight={50}
                keepSelection
                style={{ maxWidth: "100%", height: "auto" }}
              >
                <Image
                  ref={imgRef}
                  alt="Crop me"
                  src={selectedImage.url}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                    maxHeight: "400px",
                  }}
                  onLoad={(e) => {
                    setTimeout(() => {
                      const { width, height } = e.target;
                      const cropSize = Math.min(width, height) * 0.6;
                      const newCrop = {
                        unit: "px",
                        width: cropSize,
                        height: cropSize,
                        x: (width - cropSize) / 2,
                        y: (height - cropSize) / 2,
                      };
                      setCrop(newCrop);
                      setCompletedCrop(newCrop);
                    }, 100);
                  }}
                />
              </ReactCrop>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-appleGray-200 rounded-full h-2">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-appleGray-500">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-2.5 border border-appleGray-300 text-appleGray-700 rounded-xl hover:bg-appleGray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!completedCrop || uploading}
              className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 touch-manipulation"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  <span>Upload Cropped Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
