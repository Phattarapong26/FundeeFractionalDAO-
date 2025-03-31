
import { Image } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-100 rounded-md">
        <Image size={20} className="text-dao" />
      </div>
      <span className="text-xl font-bold text-dao">FractionalDAO</span>
    </div>
  );
};

export default Logo;
