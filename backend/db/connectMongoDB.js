import mongoose from "mongoose"; //mongoose is a mongodb library, easy and schema based solutions can be implemented 

const connectMongoDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI); //connect to the mmongo uri in the env file 
		console.log(`MongoDB connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error connection to mongoDB: ${error.message}`);
		process.exit(1);
	}
};

export default connectMongoDB;
