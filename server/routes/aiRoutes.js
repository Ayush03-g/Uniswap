const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const SYSTEM_PROMPT = `You are "UniSwap AI", a friendly and professional support assistant for the UniSwap Campus Marketplace platform.
Your ONLY purpose is to help buyers and sellers with UniSwap.
You must NOT answer any general knowledge, off-topic, or coding questions. 
If a user asks something outside UniSwap, politely respond: "I'm here to help you with UniSwap. Please ask me anything about buying, selling, payments, listings, categories, notes, or using the platform."

KNOWLEDGE BASE:
ACCOUNT: Sign Up, Login, Forgot Password, Email Verification, Phone Verification.
SELLING: How to list a product, Required images, Price, Categories, Notes selling, Editing listings, Deleting listings (Go to My Profile -> My Listings -> Trash icon).
BUYING: Searching, Categories, Filters, Viewing products, Sharing products, Add to Cart, Buy Now, WhatsApp Seller.
PROFILE: My Profile, My Listings, Notifications.
NOTES: How to upload notes (PDF, Hard Copy, Digital Notes).
SEARCH: Finding products, Category filtering, Price filtering.
SAFETY: Buying tips, Selling tips, Avoid scams, Meeting safely.

SMART RESPONSES (Examples):
Q: How do I sell a product?
A: Click "Sell Product", upload images, enter the title, description, category, condition, price, and submit your listing.

Q: How do I buy something?
A: Open the product, review the details, add it to your cart or click Buy Now, then contact the seller if needed.

Q: How do I upload notes?
A: Go to Sell Product, choose "Notes", then select whether you're selling Hard Copy or Digital PDF and complete the listing.

BEHAVIOUR:
- Be friendly, concise, and professional.
- Use emojis where appropriate.
- Keep answers short.
- If unsure about specific details not in the knowledge base, reply: "I'm not sure about that. Please contact UniSwap Support."
`;

router.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { history, message } = req.body;
    const msgLower = message.toLowerCase();

    // Offline Mode Logic (if API key is missing)
    if (!apiKey) {
      if (msgLower.includes("sell")) {
        return res.json({ message: "To sell a product, click the 'Sell Product' button on the navigation bar, upload images, fill in the details like title and price, and submit your listing!" });
      }
      if (msgLower.includes("buy")) {
        return res.json({ message: "To buy a product, open the product details, review it, and click 'Add to Cart' or 'Buy Now'. You can also contact the seller directly." });
      }
      if (msgLower.includes("upload notes") || msgLower.includes("notes")) {
        return res.json({ message: "To upload notes, go to 'Sell Product', choose the 'Notes' category, select whether it's a Hard Copy or Digital PDF, and complete your listing." });
      }
      if (msgLower.includes("contact")) {
        return res.json({ message: "You can contact a seller by clicking the WhatsApp icon on the product page. This will directly open a chat with them." });
      }
      if (msgLower.includes("edit")) {
        return res.json({ message: "You can edit your listing by going to 'My Profile' -> 'My Listings' and clicking the edit icon on the product." });
      }
      if (msgLower.includes("delete")) {
        return res.json({ message: "To delete your listing, go to 'My Profile' -> 'My Listings', click the Trash icon on the product, and confirm the deletion." });
      }
      if (msgLower.includes("cart")) {
        return res.json({ message: "When you click 'Add to Cart', the item is saved in your cart. You can review your cart anytime by clicking the shopping bag icon." });
      }
      if (msgLower.includes("categories") || msgLower.includes("category")) {
        return res.json({ message: "Categories group similar items together. You can browse categories like Electronics, Books, or Furniture from the Home page or Dashboard filters." });
      }
      if (msgLower.includes("search")) {
        return res.json({ message: "You can search for products using the search bar on the Home page or the Dashboard. Just type what you're looking for!" });
      }
      if (msgLower.includes("password")) {
        return res.json({ message: "If you forgot your password, you can reset it from the Login page by clicking 'Forgot Password?' and following the instructions sent to your email." });
      }

      // Default offline fallback
      return res.json({ message: "I'm here to help you with UniSwap. Please ask me anything about buying, selling, listings, notes, or using the platform." });
    }
    
    // Format history for Gemini API (roles: 'user' and 'model')
    const formattedHistory = [];
    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'model') {
          formattedHistory.push({
            role: msg.role,
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    res.json({ message: response.text });
  } catch (error) {
    // If Gemini fails, fallback to standard message without exposing server errors
    res.json({ message: "I'm here to help you with UniSwap. Please ask me anything about buying, selling, listings, notes, or using the platform." });
  }
});

module.exports = router;
