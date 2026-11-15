import React, { useState } from 'react';
import { X, BookOpen, PenTool, UserCheck } from 'lucide-react';
import { UserRole } from '../types';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';

interface RoleAuthModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  initialRole = 'reader',
  onClose,
  onSuccess,
}) => {
  const { account, signInAsRole } = useUnifiedPlatform();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState<string>(account.name || 'أحمد');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInAsRole(name, selectedRole);
    onClose();
    if (onSuccess) onSuccess(selectedRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#FAF4EC] border-2 border-[#C89D54] shadow-2xl p-6 text-[#2C1D11]">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-[#6D4C24] hover:bg-[#E7D8C3] transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-gradient-to-br from-[#6D4C24] to-[#2C1D11] border-2 border-[#C89D54] flex items-center justify-center text-[#F5D68E] font-editorial text-2xl font-bold shadow-md">
            ك
          </div>
          <h3 className="text-xl font-extrabold text-[#2C1D11]">انشاء حساب / تسجيل دخول</h3>
          <p className="text-xs text-[#6D4C24] mt-1">سجل الآن واختر: ناشر أو قارئ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('publisher')}
              className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                selectedRole === 'publisher'
                  ? 'bg-[#2B1C11] text-[#F5D68E] border-[#C89D54] shadow-md'
                  : 'bg-[#F0E4D2] text-[#4A321F] border-[#D6C1A0]'
              }`}
            >
              <PenTool className="w-5 h-5 mx-auto mb-1.5" />
              <div className="font-bold text-sm">أنا ناشر</div>
              <div className="text-[11px] opacity-80 mt-0.5">نشر كتب ومبيعات</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('reader')}
              className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                selectedRole === 'reader'
                  ? 'bg-[#C89D54] text-[#2C1D11] border-[#6D4C24] shadow-md'
                  : 'bg-[#F0E4D2] text-[#4A321F] border-[#D6C1A0]'
              }`}
            >
              <BookOpen className="w-5 h-5 mx-auto mb-1.5" />
              <div className="font-bold text-sm">أنا قارئ</div>
              <div className="text-[11px] opacity-80 mt-0.5">شراء وقراءة وتقييم</div>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4A321F] mb-1.5">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك هنا"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C89D54]/60 text-[#2C1D11] text-sm focus:outline-none focus:border-[#6D4C24]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C89D54] to-[#A87C38] text-[#2C1D11] font-extrabold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>{selectedRole === 'publisher' ? 'دخول كـ ناشر' : 'دخول كـ قارئ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
