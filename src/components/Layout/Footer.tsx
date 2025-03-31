import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
          <div>
            <h3 className="text-xl font-bold text-dao mb-4">FractionalDAO</h3>
            <p className="text-gray-500 mb-4">
              Fractional ownership platform for premium assets through decentralized governance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><NavLink to="/" className="text-gray-500 hover:text-dao transition-colors">Home</NavLink></li>
              <li><NavLink to="/marketplace" className="text-gray-500 hover:text-dao transition-colors">Marketplace</NavLink></li>
              <li><NavLink to="/dashboard" className="text-gray-500 hover:text-dao transition-colors">Dashboard</NavLink></li>
              <li><NavLink to="/governance" className="text-gray-500 hover:text-dao transition-colors">Governance</NavLink></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Whitepaper</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">FAQs</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Smart Contract</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Twitter</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Discord</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Telegram</a></li>
              <li><a href="#" className="text-gray-500 hover:text-dao transition-colors">Medium</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between px-6">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FractionalDAO. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-dao text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-dao text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
