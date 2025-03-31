
import { motion } from 'framer-motion';

const founders = [
  {
    name: "Phattarapong Phengtavee",
    title: "Founder",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4MzYzNzYwNg&ixlib=rb-4.0.3&q=80&w=400",
    delay: 0.1
  },
  {
    name: "Athitiya Chaisiriwatthanachai",
    title: "Co-Founder",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4MzYzNzYwNg&ixlib=rb-4.0.3&q=80&w=400",
    delay: 0.2
  },
  {
    name: "Kittiphat Premchit",
    title: "Co-Founder",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4MzYzNzYwNg&ixlib=rb-4.0.3&q=80&w=400",
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
                Blockchain enthusiast and visionary committed to democratizing asset ownership through innovative technology.
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Founders;
