import { CoffeeProduct, CoffeeSize } from "@/types";
import { priceWithSign } from "@/utils/helper";

interface ProductInfoProps {
  product: CoffeeProduct;
  size: CoffeeSize;
}

export default function ProductInfo({ product, size }: ProductInfoProps) {
  // ✅ Chọn giá theo size hiện tại
  const displayPrice =
    size === CoffeeSize.SMALL
      ? product.priceSmall
      : size === CoffeeSize.LARGE
      ? product.priceLarge
      : product.priceMedium;

  return (
    <div>
      <p className="text-xl font-semibold text-neutral-800">
        {product?.displayName || product?.title}
      </p>
      <p className="text-sm font-normal text-neutral-400 mt-1">
        {product?.description}
      </p>
      <p className="text-lg font-semibold text-primary-600 mt-2">
        {priceWithSign(displayPrice ?? 0)}
      </p>
    </div>
  );
}
