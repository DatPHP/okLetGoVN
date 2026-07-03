/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { DestinationItem, Review, Itinerary, GuideMessage, Promotion, User, LocationType } from "../src/types.ts";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DBStructure {
  users: Record<string, User & { passwordHash: string }>;
  destinations: DestinationItem[];
  reviews: Review[];
  itineraries: Itinerary[];
  messages: GuideMessage[];
  promotions: Promotion[];
}

// Initial pre-seeded destinations
const preSeededDestinations: DestinationItem[] = [
  // --- VŨNG TÀU (10 items) ---
  {
    id: "vt-1",
    name: "Tượng Chúa Kito Vua",
    locationType: LocationType.ATTRACTION,
    city: "VungTau",
    description: "Tượng Chúa dang tay cao 32m nằm trên đỉnh Núi Nhỏ, ôm trọn tầm nhìn toàn cảnh biển Vũng Tàu tuyệt đẹp.",
    costEstimate: 20000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 142,
    tag: "Scenic View"
  },
  {
    id: "vt-2",
    name: "Ngọn Hải Đăng Vũng Tàu",
    locationType: LocationType.ATTRACTION,
    city: "VungTau",
    description: "Hải đăng cổ xưa nhất Việt Nam, lý tưởng để ngắm hoàng hôn và thành phố lên đèn về đêm.",
    costEstimate: 15000,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 189,
    tag: "Sunset Spot"
  },
  {
    id: "vt-3",
    name: "Mũi Nghinh Phong",
    locationType: LocationType.ATTRACTION,
    city: "VungTau",
    description: "Mũi đất vươn dài ra biển lộng gió, có 'Cổng Trời' cực đẹp chụp hình check-in đón gió đại dương.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 104,
    tag: "Windswept Coast"
  },
  {
    id: "vt-4",
    name: "Bạch Dinh (Villa Blanche)",
    locationType: LocationType.ATTRACTION,
    city: "VungTau",
    description: "Dinh thự kiến trúc Pháp cổ kính bên sườn núi, từng là nơi giam lỏng vua Thành Thái.",
    costEstimate: 20000,
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    reviewsCount: 67,
    tag: "Historical"
  },
  {
    id: "vt-5",
    name: "Hòn Bà Vũng Tàu",
    locationType: LocationType.ATTRACTION,
    city: "VungTau",
    description: "Miếu nhỏ linh thiêng trên đảo đá, có con đường đi bộ rẽ sóng ra đảo cực độc đáo xuất hiện khi thủy triều rút.",
    costEstimate: 10000,
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 88,
    tag: "Adventure"
  },
  {
    id: "vt-6",
    name: "Bánh khọt Cô Ba Vũng Tàu",
    locationType: LocationType.FOOD,
    city: "VungTau",
    description: "Thương hiệu bánh khọt nổi tiếng không gian rộng rãi, vỏ giòn rụm, tôm tươi rói cuộn rau cải và đu đủ bào.",
    costEstimate: 95000,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 312,
    tag: "Culinary Icon"
  },
  {
    id: "vt-7",
    name: "Hải sản Gành Hào (Trần Phú)",
    locationType: LocationType.FOOD,
    city: "VungTau",
    description: "Nhà hàng sát bờ biển lãng mạn, ẩm thực hải sản phong phú từ ghẹ, hào né, mực một nắng cực kỳ tươi ngon.",
    costEstimate: 350000,
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 420,
    tag: "Premium Dining"
  },
  {
    id: "vt-8",
    name: "Bánh bông lan trứng muối Gốc Cột Điện",
    locationType: LocationType.FOOD,
    city: "VungTau",
    description: "Bánh bông lan nướng lò than gia truyền thơm lừng, nhân trứng muối bùi ngậy và phô mai kéo sợi.",
    costEstimate: 40000,
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 254,
    tag: "Local Snack"
  },
  {
    id: "vt-9",
    name: "Lẩu súng Phước Hải",
    locationType: LocationType.FOOD,
    city: "VungTau",
    description: "Món lẩu chua ngọt thanh mát mang hương vị miền biển đặc trưng với cá tươi, cọng bông súng giòn giòn.",
    costEstimate: 180000,
    image: "https://images.unsplash.com/photo-1547928576-a4a3323d8b62?auto=format&fit=crop&w=600&q=80",
    rating: 4.3,
    reviewsCount: 45,
    tag: "Traditional Flavor"
  },
  {
    id: "vt-10",
    name: "Soho Coffee - Đường Trần Phú",
    locationType: LocationType.FOOD,
    city: "VungTau",
    description: "Quán cafe sát biển có Wi-Fi cực nhanh, thiết kế kính hiện đại cực hợp cho giới trẻ ngồi làm việc từ xa đón gió biển.",
    costEstimate: 60000,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 156,
    tag: "Work-Friendly Cafe"
  },

  // --- ĐÀ NẴNG (10 items) ---
  {
    id: "dn-1",
    name: "Bán đảo Sơn Trà & Chùa Linh Ứng",
    locationType: LocationType.ATTRACTION,
    city: "DaNang",
    description: "Cánh rừng già giữa lòng đô thị, nơi có tượng Phật Bà Quan Thế Âm cao nhất Việt Nam nhìn ra biển Đông.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 310,
    tag: "Spiritual & Nature"
  },
  {
    id: "dn-2",
    name: "Cầu Vàng (Golden Bridge) - Bà Nà Hills",
    locationType: LocationType.ATTRACTION,
    city: "DaNang",
    description: "Kiệt tác kiến trúc nổi tiếng thế giới nâng đỡ bởi đôi bàn tay rêu phong khổng lồ ẩn hiện trong mây núi.",
    costEstimate: 900000,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 520,
    tag: "World Famous"
  },
  {
    id: "dn-3",
    name: "Ngũ Hành Sơn",
    locationType: LocationType.ATTRACTION,
    city: "DaNang",
    description: "Hệ thống 5 ngọn núi đá vôi kỳ vĩ cùng các hang động tự nhiên huyền bí và chùa cổ linh thiêng.",
    costEstimate: 40000,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 178,
    tag: "Cave Exploring"
  },
  {
    id: "dn-4",
    name: "Đèo Hải Vân (Đỉnh Thiên Hạ Đệ Nhất Hùng Quan)",
    locationType: LocationType.ATTRACTION,
    city: "DaNang",
    description: "Cung đường đèo ven biển hùng vĩ hiểm trở bậc nhất Việt Nam, nơi săn mây lý tưởng buổi sáng sớm.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 220,
    tag: "Scenic Drive"
  },
  {
    id: "dn-5",
    name: "Bãi biển Mỹ Khê",
    locationType: LocationType.ATTRACTION,
    city: "DaNang",
    description: "Một trong sáu bãi biển quyến rũ nhất hành tinh do Forbes bình chọn, cát trắng mịn, nước trong veo.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1471922639517-567ab6705f0a?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 405,
    tag: "Prisline Beach"
  },
  {
    id: "dn-6",
    name: "Mì Quảng Ếch Trang",
    locationType: LocationType.FOOD,
    city: "DaNang",
    description: "Mì Quảng biến tấu độc đáo, thịt ếch om niêu đất thơm nức mũi ăn kèm rổ rau sống tươi non.",
    costEstimate: 65000,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 298,
    tag: "Must-Try Dish"
  },
  {
    id: "dn-7",
    name: "Bánh xèo Bà Dưỡng",
    locationType: LocationType.FOOD,
    city: "DaNang",
    description: "Quán bánh xèo huyền thoại trong hẻm Hoàng Diệu, bánh đúc giòn thơm kết hợp nước chấm gan lợn béo bùi say đắm.",
    costEstimate: 80000,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 412,
    tag: "Street Food Legend"
  },
  {
    id: "dn-8",
    name: "Gỏi cá Nam Ô Thanh Hương",
    locationType: LocationType.FOOD,
    city: "DaNang",
    description: "Đặc sản gỏi cá trích trứ danh, cá ngọt lịm trộn thính dừa bùi bùi chấm nước xốt đậu phộng đậm đà.",
    costEstimate: 120000,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    reviewsCount: 94,
    tag: "Local Delicacy"
  },
  {
    id: "dn-9",
    name: "Bê thui Cầu Mống Mười",
    locationType: LocationType.FOOD,
    city: "DaNang",
    description: "Thịt bê thui chín tái hồng đào, da mỏng giòn sần sật cuốn rau rừng chấm mắm nêm nguyên chất vắt chanh.",
    costEstimate: 150000,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 165,
    tag: "Specialty Meat"
  },
  {
    id: "dn-10",
    name: "Quán Chè Sầu Liên",
    locationType: LocationType.FOOD,
    city: "DaNang",
    description: "Món tráng miệng nổi danh toàn quốc, nước cốt sầu riêng thơm lừng, thạch sương sáo mềm mại sảng khoái mát lạnh.",
    costEstimate: 35000,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 388,
    tag: "Sweet Dessert"
  },

  // --- HUẾ (10 items) ---
  {
    id: "h-1",
    name: "Đại Nội Huế (Hoàng Thành cổ kính)",
    locationType: LocationType.ATTRACTION,
    city: "Hue",
    description: "Quần thể di tích lịch sử triều Nguyễn uy nghi, lộng lẫy cổ kính lưu dấu tinh hoa kiến trúc phong kiến Việt Nam.",
    costEstimate: 200000,
    image: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 390,
    tag: "Heritage Site"
  },
  {
    id: "h-2",
    name: "Chùa Thiên Mụ",
    locationType: LocationType.ATTRACTION,
    city: "Hue",
    description: "Ngôi chùa cổ thiêng liêng soi bóng bên dòng sông Hương thơ mộng, nổi bật với tháp Phước Duyên hình bát giác.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 224,
    tag: "Scenic & Zen"
  },
  {
    id: "h-3",
    name: "Lăng Khải Định",
    locationType: LocationType.ATTRACTION,
    city: "Hue",
    description: "Tuyệt tác lăng tẩm kết hợp hoàn hảo giữa kiến trúc phương Đông cổ truyền và nghệ thuật phương Tây hiện đại.",
    costEstimate: 150000,
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 184,
    tag: "Architectural Marvel"
  },
  {
    id: "h-4",
    name: "Lăng Tự Đức",
    locationType: LocationType.ATTRACTION,
    city: "Hue",
    description: "Khu lăng tẩm thơ mộng nhất với hồ sen yên ả, rặng thông rì rào vẽ nên tâm hồn thi sĩ của vị hoàng đế triều Nguyễn.",
    costEstimate: 150000,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 112,
    tag: "Poetic Oasis"
  },
  {
    id: "h-5",
    name: "Đồi Vọng Cảnh",
    locationType: LocationType.ATTRACTION,
    city: "Hue",
    description: "Điểm ngắm khúc cua sông Hương lãng mạn, bao quanh bởi rừng thông thơ mộng tràn ngập năng lượng trong lành.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    reviewsCount: 81,
    tag: "Pine Forest View"
  },
  {
    id: "h-6",
    name: "Bún bò Huế Mụ Rớt",
    locationType: LocationType.FOOD,
    city: "Hue",
    description: "Quán bún bò gia truyền nức tiếng lâu đời, sợi bún nhỏ dai mềm, nước lèo ngọt thanh sực nức mắm ruốc thơm nồng.",
    costEstimate: 55000,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 310,
    tag: "Authentic Taste"
  },
  {
    id: "h-7",
    name: "Cơm hến Hoa Đông - Cồn Hến",
    locationType: LocationType.FOOD,
    city: "Hue",
    description: "Quán ăn lâu đời ngay Cồn Hến, tô cơm bình dân mộc mạc thơm ngọt đậm vị hến xào, đậu phộng và tớp mỡ béo ngậy.",
    costEstimate: 25000,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 145,
    tag: "Rustic Specialty"
  },
  {
    id: "h-8",
    name: "Bánh bèo nậm lọc Bà Đỏ",
    locationType: LocationType.FOOD,
    city: "Hue",
    description: "Ẩm thực cung đình Huế thu nhỏ với khay bánh bèo mỏng nhẹ, bánh nậm lá dong dẻo thơm, bánh lọc trong suốt dai giòn.",
    costEstimate: 60000,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 224,
    tag: "Imperial Snack"
  },
  {
    id: "h-9",
    name: "Chè hẻm Huế - Hùng Vương",
    locationType: LocationType.FOOD,
    city: "Hue",
    description: "Quán chè nằm sâu trong hẻm nhỏ phục vụ hàng chục loại chè rực rỡ sắc màu, nổi bật là món chè bột lọc bọc heo quay độc lạ.",
    costEstimate: 20000,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    reviewsCount: 167,
    tag: "Sweet Alley"
  },
  {
    id: "h-10",
    name: "Bánh khoái Hạnh",
    locationType: LocationType.FOOD,
    city: "Hue",
    description: "Bánh đổ giòn rụm màu vàng nghệ ôm trọn nhân tôm, thịt, giá đỗ kèm nước chấm tương gan lợn đặc sánh thơm nồng.",
    costEstimate: 60000,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 182,
    tag: "Golden Crisp"
  },

  // --- BÌNH ĐỊNH (10 items) ---
  {
    id: "bd-1",
    name: "Kỳ Co - Eo Gió",
    locationType: LocationType.ATTRACTION,
    city: "BinhDinh",
    description: "Mặt biển xanh ngọc bích phẳng lặng ôm sát vách núi đá kỳ vĩ sóng vỗ rì rào, tựa JeJu thu nhỏ của Quy Nhơn.",
    costEstimate: 120000,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 410,
    tag: "Stunning Nature"
  },
  {
    id: "bd-2",
    name: "Tháp Đôi Quy Nhơn",
    locationType: LocationType.ATTRACTION,
    city: "BinhDinh",
    description: "Cặp tháp Chăm cổ kính nguyên vẹn kiến trúc độc đáo nghìn năm tuổi tọa lạc giữa công viên rợp bóng dừa.",
    costEstimate: 20000,
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80",
    rating: 4.4,
    reviewsCount: 95,
    tag: "Ancient Champa"
  },
  {
    id: "bd-3",
    name: "Ghềnh Ráng Tiên Sa & Bãi Hoàng Hậu",
    locationType: LocationType.ATTRACTION,
    city: "BinhDinh",
    description: "Bãi biển trải dài các hòn đá cuội nhẵn bóng như trứng chim khổng lồ, nơi yên nghỉ của thi sĩ tài hoa Hàn Mặc Tử.",
    costEstimate: 10000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 154,
    tag: "Poetic Coast"
  },
  {
    id: "bd-4",
    name: "Đảo Hòn Khô",
    locationType: LocationType.ATTRACTION,
    city: "BinhDinh",
    description: "Hòn đảo hoang sơ cát trắng biển xanh ngắt, nổi bật với cây cầu gỗ ven vách đá và rặng san hô tự nhiên đa sắc màu.",
    costEstimate: 80000,
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 112,
    tag: "Coral Snorkeling"
  },
  {
    id: "bd-5",
    name: "Chùa Ông Núi & Tượng Phật ngồi lớn nhất Đông Nam Á",
    locationType: LocationType.ATTRACTION,
    city: "BinhDinh",
    description: "Đại tượng Phật Thích Ca Mâu Ni cao 69m tọa sơn hướng biển hùng vĩ trên ngọn đồi lộng gió thiêng liêng.",
    costEstimate: 0,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 134,
    tag: "Giant Buddha"
  },
  {
    id: "bd-6",
    name: "Bánh hỏi lòng heo Diên Hồng",
    locationType: LocationType.FOOD,
    city: "BinhDinh",
    description: "Đặc sản điểm tâm sáng Bình Định, sợi bánh hỏi tơi mịn thoa dầu hẹ, ăn kèm dĩa lòng heo thập cẩm luộc khói bay nghi ngút.",
    costEstimate: 45000,
    image: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 230,
    tag: "Signature Breakfast"
  },
  {
    id: "bd-7",
    name: "Chả trĩu rơm Bình Định",
    locationType: LocationType.FOOD,
    city: "BinhDinh",
    description: "Tré rơm thắt hình cán chổi độc đáo, thịt tai mũi heo trộn thính tỏi ớt nồng nàn gói lá ổi nướng rơm bùi thơm.",
    costEstimate: 50000,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 110,
    tag: "Unique Snack"
  },
  {
    id: "bd-8",
    name: "Bún chả cá Ngọc Liên",
    locationType: LocationType.FOOD,
    city: "BinhDinh",
    description: "Tô bún chả cá thanh ngọt đậm đà ninh từ xương cá biển tươi, viên chả cá thu chiên giòn dai ngon đặc biệt.",
    costEstimate: 40000,
    image: "https://images.unsplash.com/photo-1547928576-a4a3323d8b62?auto=format&fit=crop&w=600&q=80",
    rating: 4.5,
    reviewsCount: 167,
    tag: "Rich Sea Broth"
  },
  {
    id: "bd-9",
    name: "Bánh xèo tôm nhảy Gia Vỹ",
    locationType: LocationType.FOOD,
    city: "BinhDinh",
    description: "Những con tôm đất đỏ au tròn mẩy nhảy tanh tách trên chảo dầu, đổ khuôn vỏ bánh giòn ruộm chấm mắm xoài băm.",
    costEstimate: 50000,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 289,
    tag: "Jumping Shrimp"
  },
  {
    id: "bd-10",
    name: "Surf Bar - Bãi biển Quy Nhơn",
    locationType: LocationType.FOOD,
    city: "BinhDinh",
    description: "Quán cafe lãng mạn ngay trên bãi cát mịn, ngắm hoàng hôn Quy Nhơn cực đỉnh, có bàn ghế bãi biển cực chill cho laptop.",
    costEstimate: 55000,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 202,
    tag: "Beachfront Lounge"
  }
];

// Initial reviews
const preSeededReviews: Review[] = [
  {
    id: "rev-1",
    itemId: "vt-6",
    userId: "user-seed-1",
    userName: "Trần Thế Bảo",
    rating: 5,
    comment: "Bánh khọt ở đây ngon xỉu, giòn và tôm rất to tươi. Đi cuối tuần hơi đông nên chờ xíu nhưng rất đáng.",
    date: "2026-06-25T14:32:00.000Z"
  },
  {
    id: "rev-2",
    itemId: "vt-10",
    userId: "user-seed-2",
    userName: "Linh Đan Nguyễn",
    rating: 5,
    comment: "Wi-Fi nhanh vù vù, mình ngồi làm việc remote cả buổi chiều vừa uống latte vừa ngắm biển ngập gió. Xuất sắc!",
    date: "2026-06-28T09:15:00.000Z"
  },
  {
    id: "rev-3",
    itemId: "dn-2",
    userId: "user-seed-3",
    userName: "Quốc Anh Bùi",
    rating: 5,
    comment: "Cầu Vàng trong sương mù nhìn huyền ảo vô cùng. Vé cáp treo hơi cao nhưng dịch vụ Bà Nà đẳng cấp quốc tế.",
    date: "2026-06-20T11:45:00.000Z"
  },
  {
    id: "rev-4",
    itemId: "h-6",
    userId: "user-seed-4",
    userName: "Thu Trang Lê",
    rating: 4,
    comment: "Nước dùng bún bò mặn mòi ruốc đặc trưng, ăn một lần là nhớ mãi. Thịt bò mềm, giò heo giòn sần sật.",
    date: "2026-06-18T08:30:00.000Z"
  },
  {
    id: "rev-5",
    itemId: "bd-1",
    userId: "user-seed-5",
    userName: "Hoàng Minh Phạm",
    rating: 5,
    comment: "Eo Gió buổi chiều đẹp lộng gió như tranh vẽ. Nước biển Kỳ Co trong vắt thấy tận đáy, rất hợp đi nhóm bạn.",
    date: "2026-06-29T16:20:00.000Z"
  }
];

// Initial Promotions (Morning Promo Deals)
const preSeededPromotions: Promotion[] = [
  {
    id: "promo-1",
    agencyName: "Traveloka Partner",
    title: "Vũng Tàu Getaway Flash Deal",
    code: "OKLETGOVT30",
    discount: "30% OFF",
    description: "Giảm giá 30% cho dịch vụ phòng khách sạn sát biển Vũng Tàu khi đặt phòng buổi sáng sớm trước 9h.",
    expiry: "2026-07-15",
    city: "VungTau"
  },
  {
    id: "promo-2",
    agencyName: "iVIVU Luxury",
    title: "Huế Heritage Retreat",
    code: "HUEHERITAGE15",
    discount: "15% OFF",
    description: "Ưu đãi nghỉ dưỡng resort lăng tẩm thơ mộng kèm vé tham quan Đại Nội Huế trọn gói.",
    expiry: "2026-08-01",
    city: "Hue"
  },
  {
    id: "promo-3",
    agencyName: "Klook Co-Brand",
    title: "Đà Nẵng Adventure Combo",
    code: "DANANGEXPLORE",
    discount: "200.000đ",
    description: "Mã giảm giá trực tiếp khi mua combo vé Bà Nà Hills và dịch vụ đưa đón sân bay Đà Nẵng.",
    expiry: "2026-07-31",
    city: "DaNang"
  },
  {
    id: "promo-4",
    agencyName: "Vietravel Elite",
    title: "Bình Định Kỳ Co Sea-Tour",
    code: "KYCOSEAFUN",
    discount: "20% OFF",
    description: "Ưu đãi tour cano siêu tốc ra đảo Kỳ Co - Eo Gió kèm lặn ngắm san hô và thưởng thức hải sản tươi ngon.",
    expiry: "2026-07-20",
    city: "BinhDinh"
  }
];

class FlatFileDB {
  private memoryDB!: DBStructure;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.memoryDB = {
        users: {},
        destinations: preSeededDestinations,
        reviews: preSeededReviews,
        itineraries: [],
        messages: [],
        promotions: preSeededPromotions
      };
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.memoryDB = JSON.parse(fileContent);

        // Ensure all arrays/records are healthy
        if (!this.memoryDB.users) this.memoryDB.users = {};
        if (!this.memoryDB.destinations || this.memoryDB.destinations.length === 0) {
          this.memoryDB.destinations = preSeededDestinations;
        }
        if (!this.memoryDB.reviews) this.memoryDB.reviews = preSeededReviews;
        if (!this.memoryDB.itineraries) this.memoryDB.itineraries = [];
        if (!this.memoryDB.messages) this.memoryDB.messages = [];
        if (!this.memoryDB.promotions) this.memoryDB.promotions = preSeededPromotions;
      } catch (e) {
        console.error("Error reading database file, reinitializing with seeds", e);
        this.memoryDB = {
          users: {},
          destinations: preSeededDestinations,
          reviews: preSeededReviews,
          itineraries: [],
          messages: [],
          promotions: preSeededPromotions
        };
        this.save();
      }
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryDB, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing to database file:", e);
    }
  }

  // --- Users ---
  public getUsers() {
    return this.memoryDB.users;
  }

  public getUserById(id: string): User | undefined {
    const internalUser = Object.values(this.memoryDB.users).find(u => u.id === id);
    if (!internalUser) return undefined;
    const { passwordHash, ...safeUser } = internalUser;
    return safeUser;
  }

  public getUserByEmail(email: string) {
    return Object.values(this.memoryDB.users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public registerUser(name: string, email: string, phone: string, passwordHash: string): User {
    const id = "usr-" + Math.random().toString(36).substring(2, 9);
    const newUser = { id, name, email, phone, passwordHash };
    this.memoryDB.users[id] = newUser;
    this.save();
    return { id, name, email, phone };
  }

  // --- Destinations ---
  public getDestinations(city?: "DaNang" | "Hue" | "VungTau" | "BinhDinh") {
    if (city) {
      return this.memoryDB.destinations.filter((d) => d.city === city);
    }
    return this.memoryDB.destinations;
  }

  public getDestinationById(id: string) {
    return this.memoryDB.destinations.find((d) => d.id === id);
  }

  public updateDestinationRating(id: string, newRating: number) {
    const dest = this.memoryDB.destinations.find((d) => d.id === id);
    if (dest) {
      dest.reviewsCount += 1;
      dest.rating = Number(((dest.rating * (dest.reviewsCount - 1) + newRating) / dest.reviewsCount).toFixed(1));
      this.save();
    }
  }

  // --- Reviews ---
  public getReviews(itemId?: string) {
    if (itemId) {
      return this.memoryDB.reviews.filter((r) => r.itemId === itemId);
    }
    return this.memoryDB.reviews;
  }

  public addReview(itemId: string, userId: string, userName: string, rating: number, comment: string): Review {
    const id = "rev-" + Math.random().toString(36).substring(2, 9);
    const newReview: Review = {
      id,
      itemId,
      userId,
      userName,
      rating,
      comment,
      date: new Date().toISOString()
    };
    this.memoryDB.reviews.push(newReview);
    this.updateDestinationRating(itemId, rating);
    this.save();
    return newReview;
  }

  // --- Itineraries ---
  public getItineraries(userId: string) {
    return this.memoryDB.itineraries.filter((i) => i.userId === userId);
  }

  public getItineraryById(id: string) {
    return this.memoryDB.itineraries.find((i) => i.id === id);
  }

  public createItinerary(itinerary: Omit<Itinerary, "id" | "status" | "checklist" | "financialLogs" | "overallCostActual">): Itinerary {
    const id = "iti-" + Math.random().toString(36).substring(2, 9);
    
    // Auto populate initial checklist from selected items
    const checklist = itinerary.selectedItems.map((itemId) => ({
      itemId,
      completed: false
    }));

    const newItinerary: Itinerary = {
      ...itinerary,
      id,
      checklist,
      financialLogs: [],
      status: "planning",
      overallCostActual: 0
    };

    this.memoryDB.itineraries.push(newItinerary);
    this.save();
    return newItinerary;
  }

  public updateItinerary(itinerary: Itinerary) {
    const index = this.memoryDB.itineraries.findIndex((i) => i.id === itinerary.id);
    if (index !== -1) {
      this.memoryDB.itineraries[index] = itinerary;
      this.save();
      return itinerary;
    }
    throw new Error("Itinerary not found");
  }

  // --- Messages (Local Tour Guides) ---
  public getMessages(userId: string, city: "DaNang" | "Hue" | "VungTau" | "BinhDinh") {
    return this.memoryDB.messages.filter((m) => m.userId === userId && m.city === city);
  }

  public addMessage(userId: string, sender: "user" | "guide", guideName: string, text: string, city: "DaNang" | "Hue" | "VungTau" | "BinhDinh"): GuideMessage {
    const id = "msg-" + Math.random().toString(36).substring(2, 9);
    const newMessage: GuideMessage = {
      id,
      userId,
      sender,
      guideName,
      text,
      timestamp: new Date().toISOString(),
      city
    };
    this.memoryDB.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  // --- Promotions ---
  public getPromotions(city?: "DaNang" | "Hue" | "VungTau" | "BinhDinh") {
    if (city) {
      return this.memoryDB.promotions.filter((p) => p.city === city);
    }
    return this.memoryDB.promotions;
  }
}

export const db = new FlatFileDB();
