import type { Locale } from "@/lib/i18n";

type Entry = { fr: string; ar: string };

// Translation layer for DB-stored content (seeded in English).
// Unknown/custom strings pass through unchanged.
const content: Record<string, Entry> = {
  "Capture Your Most Important Moments.": { fr: "Capturez vos moments les plus importants.", ar: "التقطوا أهم لحظاتكم." },
  "Professional photography for weddings, portraits, products and events. Book your experience in minutes.": {
    fr: "Photographie professionnelle pour mariages, portraits, produits et événements. Réservez votre expérience en quelques minutes.",
    ar: "تصوير احترافي للأعراس والبورتريه والمنتجات والفعاليات. احجز تجربتك في دقائق.",
  },
  "For over five years we have been telling stories through images. Our mission is simple: make world-class photography accessible, with a booking process that respects your time.": {
    fr: "Depuis plus de cinq ans, nous racontons des histoires à travers l'image. Notre mission est simple : rendre une photographie de classe mondiale accessible, avec un processus de réservation qui respecte votre temps.",
    ar: "منذ أكثر من خمس سنوات ونحن نروي القصص عبر الصور. مهمتنا بسيطة: جعل التصوير بمستوى عالمي في متناول الجميع، مع عملية حجز تحترم وقتك.",
  },
  // Services
  "Wedding Photography": { fr: "Photographie de mariage", ar: "تصوير الأعراس" },
  "Full-day storytelling coverage for your wedding, from preparation to the last dance.": {
    fr: "Couverture narrative toute la journée de votre mariage, des préparatifs à la dernière danse.",
    ar: "تغطية كاملة ليوم عرسك، من التحضيرات إلى الرقصة الأخيرة.",
  },
  "Portrait Session": { fr: "Séance portrait", ar: "جلسة بورتريه" },
  "Studio or outdoor portrait sessions for individuals, couples and families.": {
    fr: "Séances portrait en studio ou en extérieur, pour particuliers, couples et familles.",
    ar: "جلسات بورتريه في الاستوديو أو في الخارج، للأفراد والأزواج والعائلات.",
  },
  "Product Photography": { fr: "Photographie de produit", ar: "تصوير المنتجات" },
  "Clean, conversion-ready product shots for e-commerce and catalogs.": {
    fr: "Photos produit nettes et optimisées pour la conversion, pour e-commerce et catalogues.",
    ar: "صور منتجات نظيفة وجاهزة للتحويل للمتاجر الإلكترونية والكتالوجات.",
  },
  "Event Coverage": { fr: "Couverture d'événement", ar: "تغطية الفعاليات" },
  "Conferences, parties and corporate events covered end to end.": {
    fr: "Conférences, fêtes et événements d'entreprise couverts de bout en bout.",
    ar: "مؤتمرات وحفلات وفعاليات الشركات مغطاة من البداية إلى النهاية.",
  },
  // Packages
  Basic: { fr: "Basique", ar: "أساسية" },
  Standard: { fr: "Standard", ar: "قياسية" },
  Premium: { fr: "Premium", ar: "بريميوم" },
  Essential: { fr: "Essentielle", ar: "الأساسية" },
  Deluxe: { fr: "Deluxe", ar: "ديلوكس" },
  "Half Day": { fr: "Demi-journée", ar: "نصف يوم" },
  "Full Day": { fr: "Journée complète", ar: "يوم كامل" },
  "Half-day coverage": { fr: "Couverture demi-journée", ar: "تغطية نصف يوم" },
  "Full-day coverage": { fr: "Couverture journée complète", ar: "تغطية يوم كامل" },
  "Complete experience": { fr: "Expérience complète", ar: "تجربة متكاملة" },
  "1 hour, 1 location": { fr: "1 heure, 1 lieu", ar: "ساعة واحدة، موقع واحد" },
  "2 hours, 2 locations": { fr: "2 heures, 2 lieux", ar: "ساعتان، موقعان" },
  "Up to 15 products": { fr: "Jusqu'à 15 produits", ar: "حتى 15 منتجًا" },
  "Up to 40 products": { fr: "Jusqu'à 40 produits", ar: "حتى 40 منتجًا" },
  "4 hours": { fr: "4 heures", ar: "4 ساعات" },
  // Features
  "4 hours coverage": { fr: "4 heures de couverture", ar: "تغطية 4 ساعات" },
  "1 photographer": { fr: "1 photographe", ar: "مصور واحد" },
  "100 edited photos": { fr: "100 photos retouchées", ar: "100 صورة معدّلة" },
  "6 hours coverage": { fr: "6 heures de couverture", ar: "تغطية 6 ساعات" },
  "200 edited photos": { fr: "200 photos retouchées", ar: "200 صورة معدّلة" },
  "8 hours coverage": { fr: "8 heures de couverture", ar: "تغطية 8 ساعات" },
  "2 photographers": { fr: "2 photographes", ar: "مصوران" },
  "300 edited photos": { fr: "300 photos retouchées", ar: "300 صورة معدّلة" },
  "Photo album": { fr: "Album photo", ar: "ألبوم صور" },
  "1 hour session": { fr: "Séance d'1 heure", ar: "جلسة ساعة واحدة" },
  "30 edited photos": { fr: "30 photos retouchées", ar: "30 صورة معدّلة" },
  "2 hour session": { fr: "Séance de 2 heures", ar: "جلسة ساعتين" },
  "80 edited photos": { fr: "80 photos retouchées", ar: "80 صورة معدّلة" },
  "Outfit changes": { fr: "Changements de tenues", ar: "تغييرات الأزياء" },
  "4 hour studio session": { fr: "Séance studio de 4 heures", ar: "جلسة استوديو 4 ساعات" },
  "White background": { fr: "Fond blanc", ar: "خلفية بيضاء" },
  "8 hour studio session": { fr: "Séance studio de 8 heures", ar: "جلسة استوديو 8 ساعات" },
  "Lifestyle setups": { fr: "Mises en situation lifestyle", ar: "إعدادات نمط الحياة" },
  "150 edited photos": { fr: "150 photos retouchées", ar: "150 صورة معدّلة" },
  "Same-week delivery": { fr: "Livraison dans la semaine", ar: "تسليم خلال الأسبوع" },
  // Add-ons
  "Extra Hour": { fr: "Heure supplémentaire", ar: "ساعة إضافية" },
  "One additional hour of coverage": { fr: "Une heure de couverture supplémentaire", ar: "ساعة تغطية إضافية" },
  "Second Photographer": { fr: "Second photographe", ar: "مصور ثانٍ" },
  "An additional photographer on site": { fr: "Un photographe supplémentaire sur place", ar: "مصور إضافي في الموقع" },
  "Drone Coverage": { fr: "Couverture par drone", ar: "تغطية بطائرة درون" },
  "Aerial photos and video": { fr: "Photos et vidéos aériennes", ar: "صور وفيديوهات جوية" },
  "Printed Album": { fr: "Album imprimé", ar: "ألبوم مطبوع" },
  "Hand-bound 30x30cm album": { fr: "Album artisanal 30x30 cm", ar: "ألبوم مصنوع يدويًا 30×30 سم" },
  "Extra Edited Photos": { fr: "Photos retouchées supplémentaires", ar: "صور معدّلة إضافية" },
  "10 additional edited photos": { fr: "10 photos retouchées supplémentaires", ar: "10 صور معدّلة إضافية" },
  "Second Location": { fr: "Deuxième lieu", ar: "موقع ثانٍ" },
  "Travel to an extra shooting location": { fr: "Déplacement vers un lieu de tournage supplémentaire", ar: "التنقل إلى موقع تصوير إضافي" },
  "Retouching Pack": { fr: "Pack retouche", ar: "حزمة تعديل" },
  "Advanced product retouching": { fr: "Retouche produit avancée", ar: "تعديل منتجات متقدم" },
  "Video Highlight": { fr: "Film highlight", ar: "فيديو ملخص" },
  "3-minute cinematic highlight film": { fr: "Film cinématique de 3 minutes", ar: "فيلم سينمائي ملخص مدته 3 دقائق" },
  // Gallery labels
  "Wedding ceremony": { fr: "Cérémonie de mariage", ar: "حفل زفاف" },
  "Couple portrait": { fr: "Portrait de couple", ar: "بورتريه ثنائي" },
  "Studio portrait": { fr: "Portrait studio", ar: "بورتريه استوديو" },
  "Product still life": { fr: "Nature morte produit", ar: "تصوير منتجات ثابت" },
  "E-commerce shot": { fr: "Shot e-commerce", ar: "لقطة تجارة إلكترونية" },
  "Live event": { fr: "Événement en direct", ar: "فعالية مباشرة" },
  "Conference coverage": { fr: "Couverture de conférence", ar: "تغطية مؤتمر" },
  Wedding: { fr: "Mariage", ar: "زفاف" },
  Portrait: { fr: "Portrait", ar: "بورتريه" },
  Product: { fr: "Produit", ar: "منتج" },
  Event: { fr: "Événement", ar: "فعالية" },
  "Golden hour": { fr: "Heure dorée", ar: "الساعة الذهبية" },
  Studio: { fr: "Studio", ar: "استوديو" },
};

export function tc(locale: Locale, text: string | null | undefined): string {
  if (!text || locale === "en") return text ?? "";
  const entry = content[text];
  return entry ? entry[locale as "fr" | "ar"] : text;
}
