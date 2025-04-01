import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, X, HelpCircle, Home, Coins, BarChart2, Layers, FileText, Vote, PieChart, Gift, DollarSign, Menu } from 'lucide-react';

// ข้อมูลบทเรียนและฟีเจอร์ต่างๆ
const tutorialSteps = [
  {
    id: 'welcome',
    title: 'ยินดีต้อนรับสู่ Fundee DAO',
    description: 'แพลตฟอร์มสำหรับการลงทุนแบบเศษส่วนในสินทรัพย์และการจัดการผ่านองค์กรอิสระแบบกระจายอำนาจ (DAO) บนเครือข่ายบล็อกเชน',
    image: '/mascot/welcome.png',
    icon: <Home className="w-5 h-5" />,
    detailedInfo: [
      'Fundee DAO ช่วยให้คุณสามารถลงทุนในสินทรัพย์มูลค่าสูงได้ แม้จะมีเงินทุนจำกัด ผ่านการแบ่งเศษส่วนความเป็นเจ้าของ',
      'การตัดสินใจทั้งหมดเกี่ยวกับสินทรัพย์จะถูกควบคุมโดยสมาชิกที่ถือเศษส่วนผ่านกลไกการโหวต',
      'ทุกธุรกรรมและข้อมูลถูกบันทึกบนบล็อกเชนอย่างโปร่งใสและตรวจสอบได้'
    ],
    buttons: [
      { name: 'หน้าหลัก', description: 'ไปยังหน้าแรกของแพลตฟอร์ม', icon: <Home className="w-4 h-4" /> },
      { name: 'เชื่อมต่อกระเป๋า', description: 'เชื่อมต่อกระเป๋าสตางค์ดิจิทัลของคุณเพื่อใช้งานแพลตฟอร์ม', icon: <Coins className="w-4 h-4" /> }
    ]
  },
  {
    id: 'tokens',
    title: 'โทเคนแพลตฟอร์ม FUNDFA',
    description: 'FUNDFA คือโทเคนของแพลตฟอร์มที่ใช้สำหรับการโหวตและการชำระค่าธรรมเนียม มีความสำคัญในระบบนิเวศของเรา',
    image: '/mascot/tokens.png',
    icon: <Coins className="w-5 h-5" />,
    detailedInfo: [
      'FUNDFA เป็นโทเคนมาตรฐาน ERC20 ที่สามารถซื้อขายและแลกเปลี่ยนได้',
      'คุณสามารถซื้อโทเคนได้โดยตรงผ่านแพลตฟอร์มด้วย ETH หรือผ่านตลาดซื้อขายโทเคน',
      'น้ำหนักโหวตในระบบจะขึ้นอยู่กับจำนวนโทเคน FUNDFA ที่คุณถือครอง',
      'โทเคนสามารถใช้เพื่อชำระค่าธรรมเนียมธุรกรรมแทน ETH ในอัตราที่ถูกกว่า'
    ],
    buttons: [
      { name: 'ซื้อโทเคน', description: 'ซื้อโทเคน FUNDFA ด้วย ETH', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'ตลาดโทเคน', description: 'ไปยังหน้าซื้อขายโทเคน FUNDFA', icon: <BarChart2 className="w-4 h-4" /> }
    ]
  },
  {
    id: 'assets',
    title: 'การเลือกและเรียกดูสินทรัพย์',
    description: 'เรียกดูและเลือกสินทรัพย์ที่มีการแบ่งเป็นเศษส่วนเพื่อลงทุน มีสินทรัพย์หลากหลายประเภทให้เลือกตามความสนใจ',
    image: '/mascot/assets.png',
    icon: <Layers className="w-5 h-5" />,
    detailedInfo: [
      'สินทรัพย์แต่ละรายการจะมีข้อมูลเกี่ยวกับราคาต่อเศษส่วน, จำนวนเศษส่วนทั้งหมด, อัตราผลตอบแทน (APY) และกำหนดเวลาระดมทุน',
      'คุณสามารถค้นหาและกรองสินทรัพย์ตามประเภท มูลค่า หรือความเป็นที่นิยม',
      'แต่ละสินทรัพย์มีหน้ารายละเอียดที่แสดงข้อมูลการลงทุน ประวัติราคา และข้อเสนอที่เกี่ยวข้อง',
      'ตรวจสอบสถานะการระดมทุนของสินทรัพย์ก่อนตัดสินใจลงทุน'
    ],
    buttons: [
      { name: 'ตลาดสินทรัพย์', description: 'ไปยังหน้าแสดงสินทรัพย์ทั้งหมด', icon: <BarChart2 className="w-4 h-4" /> },
      { name: 'ค้นหา', description: 'ค้นหาสินทรัพย์ตามชื่อหรือประเภท', icon: <Menu className="w-4 h-4" /> },
      { name: 'กรอง', description: 'กรองสินทรัพย์ตามเงื่อนไขต่างๆ', icon: <Layers className="w-4 h-4" /> }
    ]
  },
  {
    id: 'fees',
    title: 'การชำระค่าธรรมเนียม',
    description: 'เข้าใจระบบค่าธรรมเนียมของแพลตฟอร์มและวิธีการชำระก่อนทำธุรกรรม',
    image: '/mascot/fees.png',
    icon: <DollarSign className="w-5 h-5" />,
    detailedInfo: [
      'ค่าธรรมเนียมแก๊สจำเป็นสำหรับการทำธุรกรรมบนบล็อกเชน คุณสามารถชำระได้สองวิธี:',
      '1. ชำระด้วย ETH: 0.05 ETH ต่อธุรกรรม',
      '2. ชำระด้วยโทเคน FUNDFA: 0.022 FUNDFA ต่อธุรกรรม (ประหยัดกว่า)',
      'คุณจำเป็นต้องชำระค่าธรรมเนียมก่อนการซื้อเศษส่วนสินทรัพย์หรือการสร้างคำสั่งซื้อขาย',
      'เมื่อชำระค่าธรรมเนียมแล้ว คุณจะสามารถทำธุรกรรมได้จนกว่าจะออกจากระบบ'
    ],
    buttons: [
      { name: 'ชำระด้วย ETH', description: 'ชำระค่าธรรมเนียมด้วย ETH', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'ชำระด้วย FUNDFA', description: 'ชำระค่าธรรมเนียมด้วยโทเคน FUNDFA', icon: <Coins className="w-4 h-4" /> }
    ]
  },
  {
    id: 'investing',
    title: 'การลงทุนในสินทรัพย์',
    description: 'เรียนรู้วิธีการซื้อเศษส่วนของสินทรัพย์และกลายเป็นเจ้าของร่วม',
    image: '/mascot/invest.png',
    icon: <PieChart className="w-5 h-5" />,
    detailedInfo: [
      'ขั้นตอนการลงทุน:',
      '1. เลือกสินทรัพย์ที่คุณสนใจและเข้าสู่หน้ารายละเอียด',
      '2. ป้อนจำนวนเศษส่วนที่ต้องการซื้อ (ภายในขอบเขตการลงทุนต่ำสุดและสูงสุด)',
      '3. ตรวจสอบยอดรวมที่ต้องชำระและยืนยันการลงทุน',
      '4. หลังจากยืนยัน เศษส่วนจะถูกโอนไปยังกระเป๋าสตางค์ของคุณและคุณจะกลายเป็นเจ้าของร่วม',
      'เศษส่วนที่คุณถือครองจะปรากฏในหน้า "พอร์ตการลงทุน" ของคุณ'
    ],
    buttons: [
      { name: 'ซื้อเศษส่วน', description: 'ซื้อเศษส่วนของสินทรัพย์', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'พอร์ตการลงทุน', description: 'ดูสินทรัพย์ที่คุณลงทุน', icon: <PieChart className="w-4 h-4" /> }
    ]
  },
  {
    id: 'proposals',
    title: 'การสร้างและโหวตข้อเสนอ',
    description: 'มีส่วนร่วมในการตัดสินใจเกี่ยวกับการจัดการสินทรัพย์ผ่านระบบธรรมาภิบาลแบบกระจายอำนาจ',
    image: '/mascot/proposals.png',
    icon: <Vote className="w-5 h-5" />,
    detailedInfo: [
      'ในฐานะเจ้าของร่วม คุณสามารถสร้างข้อเสนอเกี่ยวกับการจัดการสินทรัพย์ได้ เช่น:',
      '• การอัปเดตมูลค่าสินทรัพย์',
      '• การขายสินทรัพย์ทั้งหมด',
      '• การเปลี่ยนแปลงนโยบายการจ่ายเงินปันผล',
      '• ข้อเสนอต่างๆเกี่ยวกับการพัฒนาสินทรัพย์',
      'การโหวตใช้โทเคน FUNDFA เป็นน้ำหนักเสียง โดยจำนวนโทเคนที่มากขึ้นจะมีอิทธิพลมากขึ้นในการโหวต',
      'ข้อเสนอที่ผ่านการโหวตจะถูกนำไปดำเนินการโดยอัตโนมัติผ่านสัญญาอัจฉริยะ'
    ],
    buttons: [
      { name: 'สร้างข้อเสนอ', description: 'สร้างข้อเสนอใหม่', icon: <FileText className="w-4 h-4" /> },
      { name: 'โหวต', description: 'โหวตข้อเสนอที่มีอยู่', icon: <Vote className="w-4 h-4" /> },
      { name: 'การกำกับดูแล', description: 'ดูข้อเสนอทั้งหมด', icon: <Layers className="w-4 h-4" /> }
    ]
  },
  {
    id: 'trading',
    title: 'การซื้อขายเศษส่วน',
    description: 'ซื้อขายเศษส่วนของสินทรัพย์กับผู้ใช้รายอื่นผ่านระบบการซื้อขายบนแพลตฟอร์ม',
    image: '/mascot/trading.png',
    icon: <BarChart2 className="w-5 h-5" />,
    detailedInfo: [
      'นอกจากการซื้อเศษส่วนโดยตรงจากการระดมทุน คุณยังสามารถซื้อขายกับผู้ใช้รายอื่นได้:',
      '1. สร้างคำสั่งซื้อ: ระบุจำนวนและราคาที่ต้องการซื้อ',
      '2. สร้างคำสั่งขาย: ระบุจำนวนและราคาที่ต้องการขาย',
      '3. ค้นหาคำสั่งที่มีอยู่: ดูคำสั่งซื้อขายจากผู้ใช้รายอื่น',
      '4. จับคู่คำสั่ง: ระบบจะจับคู่คำสั่งซื้อขายโดยอัตโนมัติหากราคาตรงกัน',
      'ราคาซื้อขายอาจแตกต่างจากราคาเริ่มต้น ขึ้นอยู่กับความต้องการของตลาด'
    ],
    buttons: [
      { name: 'สร้างคำสั่งซื้อ', description: 'สร้างคำสั่งซื้อเศษส่วน', icon: <DollarSign className="w-4 h-4" /> },
      { name: 'สร้างคำสั่งขาย', description: 'สร้างคำสั่งขายเศษส่วน', icon: <Coins className="w-4 h-4" /> },
      { name: 'ตลาดซื้อขาย', description: 'ดูคำสั่งซื้อขายที่มีอยู่', icon: <BarChart2 className="w-4 h-4" /> }
    ]
  },
  {
    id: 'rewards',
    title: 'การรับผลตอบแทนและเงินปันผล',
    description: 'รับผลตอบแทนตามอัตรา APY และเงินปันผลจากสินทรัพย์ที่คุณลงทุน',
    image: '/mascot/rewards.png',
    icon: <Gift className="w-5 h-5" />,
    detailedInfo: [
      'เจ้าของเศษส่วนจะได้รับผลตอบแทนในสองรูปแบบ:',
      '1. ผลตอบแทนประจำวัน: คำนวณตามอัตรา APY ของสินทรัพย์ จ่ายให้ทุกวันโดยอัตโนมัติ',
      '2. เงินปันผล: ได้รับเมื่อสินทรัพย์สร้างรายได้หรือมีการแจกเงินปันผลจากผลกำไร',
      'ผลตอบแทนทั้งหมดจะถูกแบ่งตามสัดส่วนของเศษส่วนที่คุณถือครอง',
      'เมื่อสินทรัพย์ถูกขาย คุณจะได้รับส่วนแบ่งจากการขายตามสัดส่วนเศษส่วนที่คุณมี'
    ],
    buttons: [
      { name: 'ดูผลตอบแทน', description: 'ดูผลตอบแทนที่คุณได้รับ', icon: <Gift className="w-4 h-4" /> },
      { name: 'ประวัติการจ่าย', description: 'ดูประวัติการจ่ายผลตอบแทน', icon: <FileText className="w-4 h-4" /> }
    ]
  },
  {
    id: 'contract',
    title: 'การทำงานของสัญญาอัจฉริยะ',
    description: 'เรียนรู้เกี่ยวกับสัญญาอัจฉริยะที่ใช้ในแพลตฟอร์มและวิธีการทำงานเบื้องหลัง',
    image: '/mascot/contract.png',
    icon: <FileText className="w-5 h-5" />,
    detailedInfo: [
      'แพลตฟอร์ม Fundee DAO ทำงานบนพื้นฐานของสัญญาอัจฉริยะหลักสองส่วน:',
      '1. PlatformToken: สัญญาสำหรับโทเคน FUNDFA ที่ใช้ในการโหวตและการชำระค่าธรรมเนียม',
      '2. FractionalDAO: สัญญาหลักที่จัดการสินทรัพย์ ข้อเสนอ การซื้อขาย และการจ่ายผลตอบแทน',
      'ทุกธุรกรรมและการโต้ตอบกับแพลตฟอร์มจะถูกบันทึกอย่างปลอดภัยและโปร่งใสบนบล็อกเชน',
      'สัญญาได้รับการตรวจสอบความปลอดภัยและใช้มาตรฐาน OpenZeppelin ที่ได้รับการพิสูจน์แล้ว'
    ],
    buttons: [
      { name: 'ดูรหัสสัญญา', description: 'ดูโค้ดสัญญาอัจฉริยะ', icon: <FileText className="w-4 h-4" /> },
      { name: 'ดูบนบล็อกเชน', description: 'ดูสัญญาบนเครือข่ายบล็อกเชน', icon: <Layers className="w-4 h-4" /> }
    ]
  }
];

interface FundeeTutorialProps {
  onComplete?: () => void;
}

const FundeeTutorial = ({ onComplete }: FundeeTutorialProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [askForTutorial, setAskForTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const isMobile = useMobile();
  
  // ตรวจสอบว่าเป็นผู้ใช้ใหม่หรือไม่
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        setShowDialog(true);
      }, 1000);
    }
  }, []);

  // จัดการเมื่อปิดป๊อปอัพถามว่าต้องการดูบทเรียนหรือไม่
  const handleInitialDialogClose = (wantsTutorial: boolean) => {
    setAskForTutorial(false);
    
    if (wantsTutorial) {
      setCurrentStep(0);
      setShowDialog(true);
    } else {
      setShowDialog(false);
      localStorage.setItem('hasSeenTutorial', 'true');
      if (onComplete) onComplete();
    }
  };

  // จัดการเมื่อปิดป๊อปอัพบทเรียน
  const handleDialogClose = () => {
    setShowDialog(false);
    setShowQuickAccess(false);
    localStorage.setItem('hasSeenTutorial', 'true');
    if (onComplete) onComplete();
  };

  // เปิดบทเรียนที่เลือก
  const openSpecificTutorial = (index: number) => {
    setCurrentStep(index);
    setShowQuickAccess(false);
    setShowDialog(true);
    setAskForTutorial(false);
  };

  // ไปยังขั้นตอนถัดไป
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDialogClose();
    }
  };

  // ย้อนกลับไปขั้นตอนก่อนหน้า
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // สร้างปุ่มช่วยเหลือลอยตลอดเวลา
  const HelpButton = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={() => setShowQuickAccess(true)} 
        className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg bg-primary hover:bg-primary/90"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </div>
  );

  return (
    <>
      {/* ปุ่มช่วยเหลือลอยตลอดเวลา */}
      <HelpButton />

      {/* เมนูเข้าถึงบทเรียนอย่างรวดเร็ว */}
      <Dialog open={showQuickAccess} onOpenChange={setShowQuickAccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              คู่มือการใช้งาน Fundee DAO
            </DialogTitle>
            <div className="flex justify-center my-3">
              <img 
                src="/mascot/fundee-mascot.png" 
                alt="Fundee DAO Mascot" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <DialogDescription className="text-center text-base">
              เลือกหัวข้อที่คุณต้องการเรียนรู้
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 mt-2">
            {tutorialSteps.map((step, index) => (
              <Button
                key={step.id}
                variant="outline"
                className="flex flex-col items-center justify-start h-auto py-3 px-2 hover:bg-primary/10 hover:border-primary/30"
                onClick={() => openSpecificTutorial(index)}
              >
                <div className="mb-1 text-primary">{step.icon}</div>
                <span className="text-xs font-medium">{step.title}</span>
              </Button>
            ))}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowQuickAccess(false)} className="w-full">
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ป๊อปอัพถามผู้ใช้ว่าต้องการดูบทเรียนหรือไม่ */}
      <Dialog open={showDialog && askForTutorial} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-primary">
              ยินดีต้อนรับสู่ Fundee DAO!
            </DialogTitle>
            <div className="flex justify-center my-4">
              <img 
                src="/mascot/fundee-mascot.png" 
                alt="Fundee DAO Mascot" 
                className="w-32 h-32 object-contain animate-bounce"
              />
            </div>
            <DialogDescription className="text-center text-lg">
              สวัสดีค่ะ! ฉันชื่อ Fundee หนึ่งในทีมของ Fundee DAO<br />
              คุณต้องการให้ฉันแนะนำวิธีใช้แพลตฟอร์มไหมคะ?
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 py-3 my-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
            <p className="font-medium">เกี่ยวกับ Fundee DAO:</p>
            <p>แพลตฟอร์มที่จะช่วยให้คุณลงทุนในสินทรัพย์มูลค่าสูงได้ง่ายๆ ผ่านการลงทุนแบบเศษส่วน และมีส่วนร่วมในการบริหารจัดการผ่านระบบ DAO</p>
          </div>
          <DialogFooter className="sm:justify-center gap-4 mt-3">
            <Button 
              variant="outline"
              onClick={() => handleInitialDialogClose(false)}
              className="px-6"
            >
              ไม่ ขอบคุณ
            </Button>
            <Button 
              onClick={() => handleInitialDialogClose(true)}
              className="px-6"
            >
              แนะนำฉันเลย!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ป๊อปอัพแสดงบทเรียน */}
      <Dialog open={showDialog && !askForTutorial} onOpenChange={setShowDialog}>
        <DialogContent className={`sm:max-w-${isMobile ? 'md' : 'lg'} max-h-[90vh] overflow-auto`}>
          <Button 
            onClick={handleDialogClose} 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-primary flex items-center justify-center gap-2">
              {tutorialSteps[currentStep].icon}
              {tutorialSteps[currentStep].title}
            </DialogTitle>
            <div className="flex justify-center my-4">
              <img 
                src={tutorialSteps[currentStep].image || "/mascot/fundee-mascot.png"} 
                alt={`Fundee DAO - ${tutorialSteps[currentStep].title}`} 
                className="w-40 h-40 object-contain"
              />
            </div>
            <DialogDescription className="text-center text-base">
              {tutorialSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>
          
          {/* รายละเอียดเพิ่มเติม */}
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              {tutorialSteps[currentStep].detailedInfo.map((info, index) => (
                <p key={index} className="text-sm text-gray-700">{info}</p>
              ))}
            </div>
            
            {/* แสดงปุ่มที่เกี่ยวข้องกับฟีเจอร์นี้ */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">ปุ่มที่เกี่ยวข้อง:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {tutorialSteps[currentStep].buttons.map((button, index) => (
                  <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md border border-gray-200">
                    <div className="bg-primary/10 p-2 rounded-md text-primary mr-2">
                      {button.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{button.name}</p>
                      <p className="text-xs text-gray-500">{button.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {currentStep === 0 && (
            <div className="px-4 py-2 mt-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
              <p className="font-medium">เคล็ดลับ: </p>
              <p>ดูรายละเอียดเพิ่มเติมเกี่ยวกับการทำงานของแพลตฟอร์มได้จากสัญญาอัจฉริยะของเรา (SmartContract.sol) เพื่อเข้าใจถึงวิธีการทำงานเบื้องหลัง</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full ${
                    index === currentStep ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
                  } cursor-pointer`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
                </Button>
              )}
              <Button onClick={nextStep} className="gap-1">
                {currentStep < tutorialSteps.length - 1 ? (
                  <>ถัดไป <ChevronRight className="h-4 w-4" /></>
                ) : (
                  'เสร็จสิ้น'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FundeeTutorial; 