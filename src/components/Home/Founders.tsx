import { motion } from 'framer-motion';

const founders = [
  {
    name: "Phattarapong Phengtavee",
    title: "Founder",
    image: "https://github.com/Zx0966566414/image/blob/main/Screenshot%202568-03-28%20at%2013.08.08.png?raw=true",
    delay: 0.1
  },
  {
    name: "Athitiya Chaisiriwatthanachai",
    title: "Co-Founder",
    image: "https://github.com/Zx0966566414/image/blob/main/Screenshot%202568-03-28%20at%2012.50.37.png?raw=true",
    delay: 0.2
  },
  {
    name: "Kittiphat Premchit",
    title: "Co-Founder",
    image: "https://github.com/Zx0966566414/image/blob/main/Screenshot%202568-03-28%20at%2012.57.20.png?raw=true",
    delay: 0.3
  }
];

const Founders = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="heading-lg mb-6">Our Founders</h2>
          <p className="body-md text-gray-600">
            Meet the visionary team behind FractionalDAO, working to revolutionize asset ownership through blockchain technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: founder.delay }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <div className="mb-6 rounded-full overflow-hidden w-48 h-48 mx-auto">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="heading-sm mb-2">{founder.name}</h3>
              <p className="text-blue-600 font-medium">{founder.title}</p>
              <p className="text-gray-600 mt-4">
                {founder.name === "Phattarapong Phengtavee" 
                  ? "ผู้เชี่ยวชาญด้านการลงทุนและกลยุทธ์ธุรกิจ มุ่งมั่นในการสร้างโอกาสทางการลงทุนที่เข้าถึงได้สำหรับทุกคน"
                  : founder.name === "Athitiya Chaisiriwatthanachai"
                  ? "ผู้เชี่ยวชาญด้านเทคโนโลยีและนวัตกรรม blockchain พัฒนาโซลูชันที่ก้าวล้ำนำสมัยเพื่อการเปลี่ยนแปลงอุตสาหกรรม"
                  : "นักพัฒนาและผู้เชี่ยวชาญด้าน smart contract สร้างระบบที่ปลอดภัยและมีประสิทธิภาพสำหรับการจัดการสินทรัพย์ดิจิทัล"}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Founders;
