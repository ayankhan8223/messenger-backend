import Mongoose from "mongoose";
const whatsappSchema = Mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});
export default Mongoose.model("Messages", whatsappSchema);
