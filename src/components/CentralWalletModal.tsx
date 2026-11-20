import React, { useState } from 'react';
import {
  X,
  Coins,
  CreditCard,
  Calculator,
  Share2,
  Gift,
  Trophy,
  Layers,
  Check,
  Radio,
  ArrowLeftRight,
} from 'lucide-react';
import { useUnifiedPlatform } from '../context/UnifiedPlatformContext';
import { PlatformId } from '../types';

interface CentralWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORM_TABS: { id: PlatformId; label: string; color: string }[] = [
  { id: 'book', label: 'الكتاب (بني)', color: '#6D4C24' },
  { id: 'souq', label: 'السوق (أزرق)', color: '#2563EB' },
  { id: 'audio', label: 'مشغل الصوت (بنفسجي)', color: '#7C3AED' },
  { id: 'mdlearn', label: 'MD Learn', color: '#B45309' },
  { id: 'md6', label: 'MD6 (أخضر)', color: '#059669' },
  { id: 'md7', label: 'MD7 (ذهبي)', color: '#D4AF37' },
];

export const CentralWalletModal: React.FC<CentralWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    coins,
    egpEquivalent,
    connectedPlatformsCount,
    transactionsCount,
    transactions,
    centralRankNumber,
    centralRankTitle,
    platformLevels,
    supporters,
    reserveCoins,
    submitPaymentRequest,
    calculateCoinsForEgp,
    calculateEgpForCoins,
    sendGift,
  } = useUnifiedPlatform();

  const [activeTab, setActiveTab] = useState<'wallet' | 'reserve' | 'pay' | 'calc' | 'gifts'>('wallet');
  const [activeTestPlatform, setActiveTestPlatform] = useState<PlatformId>('book');
  const [reserveCount, setReserveCount] = useState<number>(78);
  const [payEgpInput, setPayEgpInput] = useState<string>('10');
  const [calcEgpInput, setCalcEgpInput] = useState<string>('10');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  if (!isOpen) return null;

  const showMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleReserve = () => {
    const res = reserveCoins(reserveCount, activeTestPlatform);
    showMsg(res.message);
  };

  const handlePayRequest = () => {
    const val = parseFloat(payEgpInput);
    const res = submitPaymentRequest(val, activeTestPlatform);
    showMsg(res.message);
  };

  const handleShare = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'منصة الكتاب · المحفظة المركزية MD7', url });
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleGift = (amt: 3 | 6 | 9) => {
    const res = sendGift(amt, 'المؤلف وصانع المحتوى', activeTestPlatform);
    showMsg(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#FAF4EC] border-2 border-[#C89D54] shadow-2xl text-[#2C1D11] p-5 sm:p-6">
        <button
          onClick={onClose}
          className="sticky top-0 float-left p-1.5 rounded-lg text-[#6D4C24] hover:bg-[#E7D8C3] transition-colors cursor-pointer"
          aria-label="إغلاق الكارت المركزي"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Central Card Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6D4C24] text-[#F5D68E] text-[11px] font-bold mb-1.5">
            <Coins className="w-3.5 h-3.5" />
            <span>الكارت المركزي الموحد للـ 6 منصات</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#2C1D11]">
            محفظة MD7 المركزية وحسابك الموحد
          </h3>
          <p className="text-xs text-[#6D4C24] mt-0.5">
            رصيد مركزي واحد لجميع المنصات (78 عملة = 10.00 ج.م · 1 عملة = 0.128 ج.م تقريباً)
          </p>
        </div>

        {/* Cross-Platform Active Simulator Selector (Test 6-Platform Unified Wallet!) */}
        <div className="mb-4 p-3 rounded-xl bg-[#EFE4D3] border border-[#C89D54]/50">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#4A321F] flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#6D4C24]" />
              <span>المنصة النشطة المتصلة بالمحفظة (اختبار التزامن بين المنصات الـ 6):</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORM_TABS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveTestPlatform(p.id)}
                style={{
                  borderColor: activeTestPlatform === p.id ? p.color : 'rgba(109,76,36,0.25)',
                  backgroundColor: activeTestPlatform === p.id ? p.color : '#FAF4EC',
                  color: activeTestPlatform === p.id ? '#FFFFFF' : '#2C1D11',
                }}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-[#2B1C11] text-[#F5D68E] text-xs font-bold border border-[#C89D54]">
            {feedback}
          </div>
        )}

        {/* Fixed 4 Stats Grid inside Central Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="p-3 rounded-xl bg-white border border-[#D4B88C] shadow-xs">
            <div className="text-[11px] text-[#6D4C24] font-semibold">رصيدك المركزي</div>
            <div className="text-lg font-black text-[#2C1D11]">{coins} عملة</div>
            <div className="text-[10px] text-[#8C6418]">= {egpEquivalent} ج.م</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#D4B88C] shadow-xs">
            <div className="text-[11px] text-[#6D4C24] font-semibold">حساباتك على التطبيقات</div>
            <div className="text-lg font-black text-[#2C1D11]">{connectedPlatformsCount} منصات متصلة</div>
            <div className="text-[10px] text-[#6D4C24]">محفظة واحدة موحدة</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#D4B88C] shadow-xs">
            <div className="text-[11px] text-[#6D4C24] font-semibold">معاملاتك</div>
            <div className="text-lg font-black text-[#2C1D11]">{transactionsCount} معاملة</div>
            <div className="text-[10px] text-[#6D4C24]">هذا الشهر</div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#D4B88C] shadow-xs">
            <div className="text-[11px] text-[#6D4C24] font-semibold">تصنيف حسابك</div>
            <div className="text-sm font-black text-[#2C1D11]">
              المرتبة {centralRankNumber} - {centralRankTitle}
            </div>
            <div className="text-[10px] text-[#8C6418]">حساب موحد نشط</div>
          </div>
        </div>

        {/* Exact 4 Action Buttons Inside Card ONLY: [احجز عملة] - [طلب دفع] - [هتستلم كام؟] - [شارك] + Supporters/Gifts */}
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-[#D6C1A0]">
          <button
            onClick={() => setActiveTab('reserve')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              activeTab === 'reserve'
                ? 'bg-[#6D4C24] text-white border-[#6D4C24]'
                : 'bg-[#F0E4D2] text-[#2C1D11] border-[#C89D54]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>احجز عملة</span>
          </button>

          <button
            onClick={() => setActiveTab('pay')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              activeTab === 'pay'
                ? 'bg-[#6D4C24] text-white border-[#6D4C24]'
                : 'bg-[#F0E4D2] text-[#2C1D11] border-[#C89D54]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>طلب دفع</span>
          </button>

          <button
            onClick={() => setActiveTab('calc')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              activeTab === 'calc'
                ? 'bg-[#6D4C24] text-white border-[#6D4C24]'
                : 'bg-[#F0E4D2] text-[#2C1D11] border-[#C89D54]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>هتستلم كام؟</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border bg-[#F0E4D2] text-[#2C1D11] border-[#C89D54] hover:bg-[#E7D5B8] cursor-pointer transition-all"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shareCopied ? 'تم النسخ' : 'شارك'}</span>
          </button>

          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              activeTab === 'gifts'
                ? 'bg-[#2B1C11] text-[#F5D68E] border-[#C89D54]'
                : 'bg-[#EFE4D3] text-[#2C1D11] border-[#C89D54]'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>الداعمون والهدايا (3 / 6 / 9)</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all ${
              activeTab === 'wallet'
                ? 'bg-[#6D4C24] text-white border-[#6D4C24]'
                : 'bg-[#F0E4D2] text-[#2C1D11] border-[#C89D54]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المستويات والسجل</span>
          </button>
        </div>

        {/* TAB 1: [احجز عملة] */}
        {activeTab === 'reserve' && (
          <div className="p-4 rounded-xl bg-white border border-[#D4B88C] space-y-3 mb-4">
            <h4 className="font-bold text-sm text-[#2C1D11]">حجز وشراء عملات مركزية</h4>
            <div className="flex flex-wrap gap-2">
              {[39, 78, 156, 390].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setReserveCount(qty)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                    reserveCount === qty
                      ? 'bg-[#6D4C24] text-white border-[#6D4C24]'
                      : 'bg-[#FAF4EC] text-[#2C1D11] border-[#D4B88C]'
                  }`}
                >
                  {qty} عملة
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={reserveCount}
                onChange={(e) => setReserveCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                className="w-32 px-3 py-2 rounded-lg border border-[#C89D54] bg-[#FAF4EC] text-sm font-bold"
              />
              <div className="text-xs text-[#6D4C24] font-bold">
                المبلغ المطلوب: <span className="text-[#2C1D11] text-sm">{calculateEgpForCoins(reserveCount)} ج.م</span>
              </div>
            </div>
            <button
              onClick={handleReserve}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A87C38] text-[#2C1D11] font-extrabold text-sm cursor-pointer"
            >
              تأكيد حجز {reserveCount} عملة ({calculateEgpForCoins(reserveCount)} ج.م)
            </button>
          </div>
        )}

        {/* TAB 2: [طلب دفع] */}
        {activeTab === 'pay' && (
          <div className="p-4 rounded-xl bg-white border border-[#D4B88C] space-y-3 mb-4">
            <h4 className="font-bold text-sm text-[#2C1D11]">إرسال وتأكيد طلب دفع</h4>
            <div>
              <label className="block text-xs text-[#6D4C24] font-bold mb-1">المبلغ بالجنيه المصري (ج.م)</label>
              <input
                type="number"
                min={1}
                step="0.5"
                value={payEgpInput}
                onChange={(e) => setPayEgpInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C89D54] bg-[#FAF4EC] text-sm font-bold"
              />
            </div>
            <div className="text-xs text-[#4A321F]">
              الرصيد المضاف بعد التأكيد: <strong>{calculateCoinsForEgp(parseFloat(payEgpInput) || 0)} عملة مركزية</strong>
            </div>
            <button
              onClick={handlePayRequest}
              className="w-full py-2.5 rounded-xl bg-[#6D4C24] text-white font-bold text-sm cursor-pointer hover:bg-[#533818]"
            >
              إرسال وتأكيد طلب الدفع
            </button>
          </div>
        )}

        {/* TAB 3: [هتستلم كام؟] */}
        {activeTab === 'calc' && (
          <div className="p-4 rounded-xl bg-white border border-[#D4B88C] space-y-3 mb-4">
            <h4 className="font-bold text-sm text-[#2C1D11]">حاسبة «هتستلم كام؟» (10 ج.م = 78 عملة)</h4>
            <div>
              <label className="block text-xs text-[#6D4C24] font-bold mb-1">اكتب المبلغ بالجنيه المصري (ج.م)</label>
              <input
                type="number"
                min={0}
                value={calcEgpInput}
                onChange={(e) => setCalcEgpInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#C89D54] bg-[#FAF4EC] text-sm font-bold"
              />
            </div>
            <div className="p-3 rounded-xl bg-[#2B1C11] text-[#F5D68E] text-center">
              <div className="text-xs opacity-80">لو دفعت {parseFloat(calcEgpInput) || 0} جنيه، هتستلم:</div>
              <div className="text-2xl font-black mt-1">
                {calculateCoinsForEgp(parseFloat(calcEgpInput) || 0)} عملة
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: [الداعمون والهدايا 3 / 6 / 9 فقط] */}
        {activeTab === 'gifts' && (
          <div className="space-y-4 mb-4">
            <div className="p-4 rounded-xl bg-[#2B1C11] text-[#FAF4EC] border border-[#C89D54]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-[#F5D68E] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#F5D68E]" />
                  <span>هدايا البث المباشر والدعم (بدون عمولة مخفية)</span>
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2.5 my-3">
                {([3, 6, 9] as const).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleGift(amt)}
                    className="py-3 px-2 rounded-xl bg-[#3E2918] hover:bg-[#533818] border border-[#C89D54] text-center transition-all cursor-pointer"
                  >
                    <Gift className="w-5 h-5 text-[#F5D68E] mx-auto mb-1" />
                    <div className="font-extrabold text-sm text-white">{amt} عملات</div>
                    <div className="text-[10px] text-[#E3C896]">ارسل هدية</div>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-[#F5D68E] font-bold">
                دعم مباشر بالكامل للمؤلف والناشر
              </p>
            </div>

            {/* [الداعمون] Card */}
            <div className="p-4 rounded-xl bg-white border border-[#D4B88C]">
              <h4 className="font-bold text-sm text-[#2C1D11] flex items-center gap-1.5 mb-2.5">
                <Trophy className="w-4 h-4 text-[#C89D54]" />
                <span>الداعمون (الأكثر دعماً في الأعلى)</span>
              </h4>
              <div className="space-y-2">
                {supporters.map((sup, idx) => (
                  <div
                    key={sup.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF4EC] border border-[#E7D8C3] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#6D4C24] text-white flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#2C1D11]">{sup.name}</span>
                    </div>
                    <div className="text-left">
                      <span className="font-black text-[#6D4C24]">{sup.totalCoins} عملة</span>
                      <span className="text-[10px] text-[#8C6418] mr-2">({sup.lastTimestamp})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Per-Platform Levels + Recent Transactions */}
        {activeTab === 'wallet' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white border border-[#D4B88C]">
              <h4 className="font-bold text-sm text-[#2C1D11] mb-2.5">
                مستوى الحساب بتاعك على كل منصة (الألوان المحجوزة المعتمدة)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {platformLevels.map((lvl) => (
                  <div
                    key={lvl.id}
                    style={{ borderColor: lvl.colorHex }}
                    className="p-2.5 rounded-xl border bg-[#FAF4EC]"
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ color: lvl.colorHex }} className="font-extrabold text-xs">
                        {lvl.name}
                      </span>
                      <span
                        style={{ backgroundColor: lvl.colorHex }}
                        className="w-2.5 h-2.5 rounded-full inline-block"
                      />
                    </div>
                    <div className="text-xs font-bold text-[#2C1D11] mt-1">{lvl.levelLabel}</div>
                    <div className="text-[10px] text-[#6D4C24]">XP: {lvl.xp}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#D4B88C]">
              <h4 className="font-bold text-sm text-[#2C1D11] mb-2">آخر المعاملات المركزية</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#FAF4EC] border border-[#E7D8C3]"
                  >
                    <div>
                      <div className="font-bold text-[#2C1D11]">{tx.title}</div>
                      <div className="text-[10px] text-[#6D4C24]">{tx.timestamp}</div>
                    </div>
                    <span className={`font-black ${tx.coinsDelta >= 0 ? 'text-emerald-700' : 'text-[#6D4C24]'}`}>
                      {tx.coinsDelta >= 0 ? `+${tx.coinsDelta}` : tx.coinsDelta} عملة
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
