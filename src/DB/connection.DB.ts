import mongoose from 'mongoose';

export const connectDB = async():Promise<void>=>{
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/socialApp')
        console.log("connected to mongoose db..❤️");

  } catch (error) {
        console.log("Error connecting to mongoose db..🤦😢", error);
  }
}

