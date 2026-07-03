/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db } from "./server/db.ts";
import { LocationType } from "./src/types.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will run in offline demo mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust wrapper to perform content generation with model fallback and automatic retries
async function generateContentWithFallback(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getGeminiClient();
  // Models to try in order of preference
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[AI] Requesting model: ${modelName} (Attempt ${attempt}/2)`);
        
        const config: any = {};
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined,
        });

        if (response && response.text) {
          console.log(`[AI] Successfully generated content using: ${modelName}`);
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI] Error using ${modelName} on attempt ${attempt}:`, err?.message || err);
        if (attempt < 2) {
          // Delay briefly before retrying the same model (exponential backoff helper)
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }
    }
  }

  throw lastError || new Error("All fallback models failed to generate content.");
}

// Custom simple token auth middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Không tìm thấy mã xác thực. Vui lòng đăng nhập." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    // Decode plain string token (contains userId)
    const userId = Buffer.from(token, "base64").toString("utf-8");
    const user = db.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: "Người dùng không tồn tại hoặc phiên hết hạn." });
      return;
    }
    req.userId = userId;
    next();
  } catch (e) {
    res.status(401).json({ error: "Mã xác thực không hợp lệ." });
  }
}

// --- API ROUTES ---

// 1. Register
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Vui lòng nhập đầy đủ tất cả các trường thông tin." });
    return;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Địa chỉ Email không hợp lệ." });
    return;
  }

  // Validate Phone: Must be exactly 10 digits and start with 0
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ error: "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0." });
    return;
  }

  // Check if email already registered
  const existingUser = db.getUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: "Email này đã được đăng ký sử dụng." });
    return;
  }

  // Simple password hashing (base64 for security and robust compilation in container)
  const passwordHash = Buffer.from(password).toString("base64");
  const user = db.registerUser(name, email, phone, passwordHash);

  // Generate token containing userId
  const token = Buffer.from(user.id).toString("base64");

  res.status(201).json({ user, token });
});

// 2. Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Vui lòng nhập đầy đủ Email và Mật khẩu." });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
    return;
  }

  const inputPasswordHash = Buffer.from(password).toString("base64");
  if (user.passwordHash !== inputPasswordHash) {
    res.status(401).json({ error: "Email hoặc mật khẩu không chính xác." });
    return;
  }

  // Generate token containing userId
  const token = Buffer.from(user.id).toString("base64");
  const { passwordHash, ...safeUser } = user;

  res.json({ user: safeUser, token });
});

// Get profile
app.get("/api/auth/me", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: "Không tìm thấy tài khoản." });
    return;
  }
  res.json(user);
});

// 3. Destinations
app.get("/api/destinations", (req: Request, res: Response) => {
  const city = req.query.city as "DaNang" | "Hue" | "VungTau" | "BinhDinh" | undefined;
  const list = db.getDestinations(city);
  res.json(list);
});

// 4. Destination by ID
app.get("/api/destinations/:id", (req: Request, res: Response) => {
  const item = db.getDestinationById(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Không tìm thấy địa điểm." });
    return;
  }
  res.json(item);
});

// 5. Destination Reviews
app.get("/api/destinations/:id/reviews", (req: Request, res: Response) => {
  const reviews = db.getReviews(req.params.id);
  res.json(reviews);
});

app.post("/api/destinations/:id/reviews", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { rating, comment } = req.body;
  const userId = req.userId!;
  const user = db.getUserById(userId)!;

  if (!rating || !comment) {
    res.status(400).json({ error: "Vui lòng cung cấp đầy đủ điểm đánh giá và nhận xét." });
    return;
  }

  const review = db.addReview(req.params.id, userId, user.name, Number(rating), comment);
  res.status(201).json(review);
});

// 6. Promotions
app.get("/api/promotions", (req: Request, res: Response) => {
  const city = req.query.city as "DaNang" | "Hue" | "VungTau" | "BinhDinh" | undefined;
  const promotions = db.getPromotions(city);
  res.json(promotions);
});

// 7. Get itineraries
app.get("/api/itineraries", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const list = db.getItineraries(req.userId!);
  res.json(list);
});

// 8. Create & compute AI Itinerary
app.post("/api/itineraries", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { city, daysCount, startDate, selectedItems, overallCostEstimate } = req.body;
  const userId = req.userId!;

  if (!city || !daysCount || !startDate || !selectedItems || !Array.isArray(selectedItems)) {
    res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin hành trình và danh sách địa điểm." });
    return;
  }

  // Get selected destination names
  const allDestinations = db.getDestinations(city);
  const selectedDetails = allDestinations.filter((d) => selectedItems.includes(d.id));
  const selectedNames = selectedDetails.map((d) => `${d.name} (${d.locationType === LocationType.ATTRACTION ? "Địa điểm tham quan" : "Món ăn/Ẩm thực"})`);

  // Map City Name to Vietnamese
  const vietnameseCities = {
    DaNang: "Đà Nẵng",
    Hue: "Huế",
    VungTau: "Vũng Tàu",
    BinhDinh: "Bình Định",
  };
  const cityName = vietnameseCities[city as keyof typeof vietnameseCities] || city;

  // Run AI Gemini Advice
  let aiConsultation = "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Bạn là trợ lý du lịch AI cao cấp của OkLetGoVN (okletgovn). Hãy lập một lịch trình chi tiết và tư vấn cho một chuyên viên văn phòng/người đi làm trong độ tuổi 25-35 muốn đi du lịch tại thành phố ${cityName} trong thời gian ${daysCount} ngày, bắt đầu từ ngày ${startDate}.
Họ đã lựa chọn các địa điểm nổi tiếng và đặc sản ẩm thực sau từ cơ sở dữ liệu hệ thống:
${selectedNames.map(name => `- ${name}`).join('\n')}

Hãy thiết kế một lịch trình cá nhân hóa hoàn chỉnh, logic theo từng ngày, từng mốc giờ thời gian cụ thể sáng - trưa - chiều - tối (timeline Itinerary).
Vui lòng phân bổ hợp lý các địa điểm đã chọn vào các ngày để hành trình thư thái nhưng trọn vẹn.
Với tư cách là chuyên gia du lịch địa phương sành sỏi, hãy đề xuất thêm các mẹo cụ thể (ví dụ: góc chụp ảnh đẹp nhất, thời gian tránh đông đúc), gợi ý phương tiện di chuyển tối ưu nhất (ví dụ: thuê xe máy, xe điện, taxi công nghệ).
ĐẶC BIỆT đề xuất 1 quán cà phê yên tĩnh có thiết kế hiện đại, Wi-Fi nhanh, ổ cắm đầy đủ trong thành phố cực kỳ phù hợp để kết hợp làm việc từ xa (digital nomad/remote work) cho đối tượng 25-35 tuổi này.
Ước lượng chi phí dự phòng chi tiết cho từng ngày, món ăn (bằng VNĐ) để họ dễ dàng chuẩn bị ngân sách.

Yêu cầu định dạng: Trình bày dưới dạng Markdown chuẩn, chuyên nghiệp, hấp dẫn, dễ nhìn và sử dụng từ ngữ truyền cảm hứng du lịch.`;

      const responseText = await generateContentWithFallback(prompt);
      aiConsultation = responseText || "Không có phản hồi từ AI.";
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      aiConsultation = `### Không thể kết nối AI thời gian thực lúc này.\n\n**Hệ thống đã tự động xây dựng lịch trình mẫu cho bạn:**\n\n*   **Ngày 1**: Nhận phòng khách sạn, di chuyển tham quan các địa điểm gần trung tâm thành phố ${cityName}. Buổi tối thưởng thức đặc sản địa phương.\n*   **Ngày 2**: Trải nghiệm các danh thắng thiên nhiên nổi tiếng nhất trong danh sách lựa chọn của bạn. Kết hợp làm việc tại quán cafe bờ biển có sóng Wi-Fi nhanh.\n*   **Ngày 3**: Săn mã voucher sáng sớm từ đại lý, mua sắm quà lưu niệm địa phương và chuẩn bị hành lý trở về.\n\n*Chi phí dự tính cho toàn bộ hành trình là khoảng ${overallCostEstimate.toLocaleString()} VNĐ.*`;
    }
  } else {
    // Offline / No API Key Demo Mode
    aiConsultation = `### Chào mừng bạn đến với Lịch trình Thông minh OkLetGoVN (Demo Mode)\n\nDo API Key chưa được cấu hình đầy đủ, hệ thống đã tự động kích hoạt **Thuật toán Offline** tối ưu lịch trình cho chuyến đi **${cityName}** (${daysCount} ngày):\n\n#### 🗓️ Lịch Trình Chi Tiết Đề Xuất\n\n*   **Ngày 1: Check-in & Khám Phá Nhẹ Nhàng**\n    *   *Sáng/Trưa*: Nhận phòng, thưởng thức các món ẩm thực bạn đã chọn.\n    *   *Chiều*: Ghé thăm địa danh nổi tiếng ngoài trời mát mẻ.\n    *   *Tối*: Dạo mát ngắm hoàng hôn, nghỉ ngơi.\n\n*   **Ngày 2: Hoạt Động Trải Nghiệm & Work-from-Anywhere**\n    *   *Sáng*: Săn voucher khuyến mãi đại lý trên mục Deals, tham quan địa danh lớn.\n    *   *Chiều*: Làm việc remote 2-3 tiếng tại quán cà phê địa phương được đánh giá cao (Wi-Fi 5G, ổ cắm tiện lợi).\n    *   *Tối*: Hải sản tươi ngon ven biển, thảo luận trực tiếp cùng Tour Guide.\n\n*   **Ngày 3: Hoàn thành mục tiêu & Report**\n    *   *Sáng*: Đi nốt các địa điểm trong checklist đã lưu.\n    *   *Trưa*: Check-out khách sạn, tổng hợp chi phí thực tế tại màn hình Report.\n\n#### ☕ Khuyến Nghị Co-working Space cho giới 25-35 tuổi:\n*   **Vũng Tàu**: Soho Coffee - Trần Phú (View biển trực diện, ổ cắm dọc tường, cực chill).\n*   **Đà Nẵng**: Enouvo Space - An Hải Bắc (Trung tâm làm việc sáng tạo đầy đủ trang thiết bị).\n*   **Huế**: Trà Tiệm Vy - Hùng Vương (Không gian yên tĩnh, gỗ trầm mang tính văn hóa).\n*   **Bình Định**: Surf Bar - Nguyễn Huệ (Sát bờ biển bãi cát Quy Nhơn, lộng gió thích hợp làm việc sáng tạo).`;
  }

  const created = db.createItinerary({
    userId,
    city,
    daysCount: Number(daysCount),
    startDate,
    selectedItems,
    aiConsultation,
    overallCostEstimate: Number(overallCostEstimate)
  });

  res.status(201).json(created);
});

// 9. Update Itinerary
app.put("/api/itineraries/:id", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const itinerary = req.body;
  if (!itinerary || itinerary.id !== req.params.id) {
    res.status(400).json({ error: "Dữ liệu hành trình cập nhật không khớp." });
    return;
  }

  try {
    const updated = db.updateItinerary(itinerary);
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: e.message || "Không tìm thấy lịch trình." });
  }
});

// 10. Get Chat Messages
app.get("/api/messages", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const city = req.query.city as "DaNang" | "Hue" | "VungTau" | "BinhDinh" | undefined;
  if (!city) {
    res.status(400).json({ error: "Vui lòng cung cấp tham số thành phố (city)." });
    return;
  }
  const messages = db.getMessages(req.userId!, city);
  res.json(messages);
});

// 11. Send Message (with AI Tour Guide instant responsive simulation!)
app.post("/api/messages", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { text, city } = req.body;
  const userId = req.userId!;

  if (!text || !city) {
    res.status(400).json({ error: "Nội dung tin nhắn và thành phố không được trống." });
    return;
  }

  // Guide naming mapped by city
  const guideNames = {
    VungTau: "Anh Nam (Thổ địa Vũng Tàu)",
    DaNang: "Chị Vy (Chuyên gia Đà Thành)",
    Hue: "Cô Thảo (Hướng dẫn viên Cố Đô)",
    BinhDinh: "Chú Ba (Thổ địa Quy Nhơn)",
  };
  const guideName = guideNames[city as keyof typeof guideNames] || "Thổ địa OkLetGo";
  const vietnameseCities = {
    VungTau: "Vũng Tàu",
    DaNang: "Đà Nẵng",
    Hue: "Huế",
    BinhDinh: "Bình Định",
  };
  const cityName = vietnameseCities[city as keyof typeof vietnameseCities] || city;

  // Save user's message
  const userMsg = db.addMessage(userId, "user", guideName, text, city);

  // Trigger tour guide auto-reply using Gemini SDK or custom responsive agent rules
  const apiKey = process.env.GEMINI_API_KEY;
  let guideReplyText = "";

  if (apiKey) {
    try {
      const prompt = `Bạn là một hướng dẫn viên bản địa cực kỳ nhiệt tình, vui vẻ tên là "${guideName}" sống ở thành phố du lịch "${city}".
Một du khách trẻ tuổi (25-35 tuổi, năng động, bận rộn công việc văn phòng và thích trải nghiệm thực tế) đang nhắn tin trực tiếp hỏi bạn trong ứng dụng du lịch "okletgovn" như sau:
"${text}"

Hãy trả lời họ một cách thân thiện nhất, đúng giọng điệu của người bản xứ địa phương, đưa ra lời khuyên ngắn gọn, thực tế, hữu ích về món ăn ngon nhất, cung đường tối ưu hoặc mẹo du lịch bí mật.
Yêu cầu trả lời súc tích, ngắn gọn (chỉ từ 1 đến tối đa 3 câu ngắn), ấm áp và hiếu khách. Không được giả tạo hay quá trang trọng.`;

      const responseText = await generateContentWithFallback(prompt);
      guideReplyText = responseText?.trim() || "Chào bạn nha! Mình nghe đây, bạn cần tư vấn thêm gì cứ hỏi mình nhé!";
    } catch (e) {
      guideReplyText = `Dạ chào bạn! Lời khuyên của thổ địa ${cityName} tụi mình là bạn hãy ghé các quán nhỏ trong hẻm lúc xế chiều để ăn được chuẩn vị nhất và tránh đông đúc nghen!`;
    }
  } else {
    // Elegant local simulator response mapping
    const offlineReplies = {
      VungTau: [
        "Dạ chào bạn nha! Buổi sáng mát mẻ bạn nên ra Hải đăng sớm chụp hình lúc 7h sáng ít người cực đẹp, sau đó ghé Gốc Cột Điện mua bông lan ăn lót dạ nha!",
        "Hải sản Gành Hào thì ngắm hoàng hôn đỉnh nhất luôn bạn ơi! Nhớ gọi điện đặt bàn sát biển trước 1 ngày kẻo hết chỗ nghen.",
        "Đi cafe làm việc ở Vũng Tàu thì Soho Coffee là số dách luôn á, mạng mạnh mà view biển bao thoáng đãng khơi nguồn cảm hứng."
      ],
      DaNang: [
        "Chào bạn ghé thăm Đà Nẵng nha! Bánh xèo Bà Dưỡng ăn bao phê luôn, nhưng lối vào hẻm hơi nhỏ, bạn nên gửi xe ở đầu đường Hoàng Diệu rồi đi bộ vô nha.",
        "Sáng sớm tầm 5h bạn chạy xe máy lên đèo Hải Vân ngắm bình minh mây phủ vách núi là phê nhất cuộc đời luôn đó bạn!",
        "Mì Quảng Ếch Trang ăn lạ miệng, không gian cực sạch sẽ và mát mẻ, rất hợp tiếp đối tác hoặc ngồi ăn trưa xả stress."
      ],
      Hue: [
        "Dạ o chào em ghé cố đô Huế thơ mộng nha! Bún bò Mũ Rớt nức tiếng lâu đời rồi, em nhớ ghé ăn trước 9h sáng nghe, trễ là hết mọc ngon lắm á.",
        "Đại Nội Huế rộng lắm, em nên thuê hướng dẫn viên thuyết minh tại cổng hoặc dùng app để nghe tích sử mới thấy hết cái hay cái đẹp của triều Nguyễn nghe.",
        "Tối mát mẻ em ra bờ sông Hương, ghé chè hẻm làm ly chè heo quay độc đáo thanh mát là trọn vẹn hương vị Huế luôn nờ."
      ],
      BinhDinh: [
        "Chào cháu ghé Quy Nhơn nha! Kỳ Co - Eo Gió mùa này biển trong xanh như ngọc bích, cháu nên đi ca-nô buổi sáng lúc sóng lặng êm đềm chụp ảnh siêu nét.",
        "Sáng ra làm dĩa bánh hỏi lòng heo nóng hổi Diên Hồng là tràn trề sinh lực khám phá cả ngày luôn nha cháu.",
        "Tối ngắm biển mát rượi thì Surf Bar thẳng tiến cháu ơi, ngồi bãi cát nhâm nhi dừa tươi cảm giác tự do tự tại sướng rơn."
      ]
    };

    const cityName = city as keyof typeof offlineReplies;
    const replies = offlineReplies[cityName] || [
      "Dạ mình nghe đây bạn ơi! Du lịch tự túc thì quan trọng nhất là sức khoẻ và tiết kiệm chi phí, có gì thắc mắc bạn cứ hỏi thổ địa tụi mình hỗ trợ hết lòng nha!"
    ];
    guideReplyText = replies[Math.floor(Math.random() * replies.length)];
  }

  // Simulate delay and save guide response
  setTimeout(() => {
    db.addMessage(userId, "guide", guideName, guideReplyText, city);
  }, 1000);

  res.status(201).json(userMsg);
});

// Create Express Server setup for development and production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[okletgovn] Server running at http://localhost:${PORT}`);
  });
}

startServer();
