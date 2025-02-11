import mongoose from "mongoose";

// MongoDB Connection
const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// Define Schema for Break Times
const breakSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  duration: { type: Number, required: true }, // duration in minutes
});

const Break = mongoose.models.Break || mongoose.model("Break", breakSchema);

// API Route to track breaks
export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "POST") {
    const { start, end, duration } = req.body;

    if (!start || !end || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newBreak = new Break({ start, end, duration });
      await newBreak.save();
      return res.status(200).json({ message: "Break tracked successfully!" });
    } catch (error) {
      return res.status(500).json({ error: "Error saving break time" });
    }
  } else if (req.method === "GET") {
    try {
      const breaks = await Break.find();
      return res.status(200).json(breaks);
    } catch (error) {
      return res.status(500).json({ error: "Error fetching breaks" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
