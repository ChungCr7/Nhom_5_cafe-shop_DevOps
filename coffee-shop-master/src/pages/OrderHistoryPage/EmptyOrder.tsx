import { useNavigate } from "react-router-dom";
import ButtonFilled from "@/components/shared/button/ButtonFilled";
import { useModal } from "@/hooks/useModal";

export default function EmptyOrder() {
  const navigate = useNavigate();
  const { closeCartModal } = useModal();

  const handleContinueClick = () => {
    navigate("/products");
    closeCartModal();
  };

  return (
    <div className="h-full flex flex-col justify-center items-center text-center py-10">
      <img
        src="/images/empty-folder.png"
        className="w-1/2 md:w-1/3 mb-6"
        alt="Empty Folder"
      />
      <h3 className="text-primary-800 text-2xl font-bold mb-3">
        Bạn chưa có đơn hàng nào
      </h3>
      <p className="text-gray-500 mb-4">
        Có vẻ như bạn chưa từng đặt hàng. Hãy ghé cửa hàng và chọn món yêu thích nhé!
      </p>
      <ButtonFilled onClick={handleContinueClick}>Mua sắm ngay</ButtonFilled>
    </div>
  );
}
