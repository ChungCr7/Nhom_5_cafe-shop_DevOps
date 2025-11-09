// src/components/shared/card/DataCard.tsx
import { HeroIcon } from "@/types";

interface DataCardProps {
  label: string;
  value: number;
  Icon: HeroIcon;
}

export default function DataCard({ label, value, Icon }: DataCardProps) {
  return (
    <div className="flex items-center gap-4 w-full bg-gray-50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 🧩 Icon hiển thị bên trái */}
      <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>

      {/* 📊 Thông tin thống kê */}
      <div className="text-left">
        <span className="block text-gray-400 text-xs font-medium">{label}</span>
        <span className="block text-amber-800 text-xl font-bold">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
