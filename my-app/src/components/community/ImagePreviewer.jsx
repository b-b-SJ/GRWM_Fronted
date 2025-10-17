import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
const ImagePreviewer = ({
  previewImages,
  setPreviewImages,
  imagesUrl,
  setImagesUrl,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  //삭제
  const removeImage = (indexToRemove) => {
    setImagesUrl(imagesUrl.filter((_, index) => index !== indexToRemove));
    setPreviewImages(
      previewImages.filter((_, index) => index !== indexToRemove)
    );

    //미리 보기 내 삭제
    if (currentImageIndex >= previewImages.length - 1) {
      setCurrentImageIndex(Math.max(0, previewImages.length - 2));
    }
  };

  //<-이전 이미지
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  //->다음 이미지
  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div>
      {/* 이미지 미리보기 */}
      {previewImages.length > 0 && (
        <div className="relative">
          {/* 메인 이미지 */}
          <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewImages[currentImageIndex]}
              alt={`미리보기 ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />

            {/* X 삭제 버튼 */}
            <button
              onClick={() => removeImage(currentImageIndex)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
            >
              <X size={20} />
            </button>

            {/* 좌우 화살표 (이미지가 2개 이상일 때만) */}
            {previewImages.length > 1 && (
              <>
                {/* 왼쪽 화살표 */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* 오른쪽 화살표 */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* 인디케이터 (현재 이미지 위치 표시) */}
            {previewImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {previewImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white bg-opacity-50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 썸네일 목록*/}
          {previewImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {previewImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex
                      ? "border-rose-500"
                      : "border-gray-300 opacity-60"
                  }`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ImagePreviewer;
