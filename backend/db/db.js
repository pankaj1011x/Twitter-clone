import mongoose from "mongoose";

const connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(`error connecting to mongo, ${err.message}`);
    process.exit(1);
  }
};

export default connectMongo;
