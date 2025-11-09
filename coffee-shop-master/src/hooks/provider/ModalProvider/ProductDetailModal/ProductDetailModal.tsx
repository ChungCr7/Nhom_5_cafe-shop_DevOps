import BaseModal from "@/components/shared/modal/BaseModal";
import { CoffeeProduct, CoffeeSize } from "@/types";
import Footer from "./Footer";
import ProductSizeSwitch from "./ProductSizeSwitch";
import ProductInfo from "./ProductInfo";
import ProductImage from "./ProductImage";
import { useState } from "react";

interface ProductDetailModalProps {
  product: CoffeeProduct | null;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<CoffeeSize>(CoffeeSize.MEDIUM);

  return (
    <BaseModal show={!!product} onClose={onClose}>
      {product && (
        <>
          <ProductImage product={product} onClose={onClose} />
          <div className="p-4 pb-8">
            {/* 🏷️ Thông tin sản phẩm */}
            <ProductInfo product={product} size={selectedSize} />
            <hr className="my-4" />
            {/* 🧩 Chọn size */}
            <ProductSizeSwitch
              selectedSize={selectedSize}
              onChangeSize={setSelectedSize}
            />
          </div>
          {/* 🛒 Footer giữ nguyên */}
          <Footer product={product} onClose={onClose} />
        </>
      )}
    </BaseModal>
  );
}
