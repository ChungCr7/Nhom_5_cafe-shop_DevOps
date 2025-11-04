// ✅ Gộp class Tailwind an toàn
export function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ✅ Format tiền tệ sang VNĐ
export function formatPrice(price?: number): string {
  if (price == null || isNaN(price)) return "0";
  return price.toLocaleString("vi-VN"); // 👉 30.000
}

// ✅ Thêm ký hiệu tiền VNĐ
export const priceWithSign = (price?: number): string =>
  `${formatPrice(price)} VNĐ`;

// ✅ Tính tổng mảng số
export function getSumFromArr(numberArr: number[]): number {
  return numberArr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
}

// ✅ Promise chờ giả lập
export const fakeTimer = (milliseconds: number = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
