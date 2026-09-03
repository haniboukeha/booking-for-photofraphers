export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}

export function parseLocale(value: string | undefined | null): Locale {
  return (LOCALES as readonly string[]).includes(value ?? "") ? (value as Locale) : "en";
}

export function fmt(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export interface Dict {
  dir: "ltr" | "rtl";
  langLabel: string;
  nav: { home: string; services: string; gallery: string; about: string; contact: string };
  common: { bookNow: string; viewServices: string; cart: string; from: string; packages: string; total: string; remove: string };
  footer: { explore: string; contact: string; visit: string; rights: string; reviewed: string };
  home: {
    ctaServices: string; ctaCheckDate: string; replyWithin: string; clients: string; projects: string;
    whatWeDo: string; servicesTitle: string; allServices: string;
    howTitle: string; howSub: string; how1t: string; how1d: string; how2t: string; how2d: string; how3t: string; how3d: string;
    portfolio: string; recentWork: string; fullGallery: string;
    kindWords: string; t1q: string; t1n: string; t1m: string; t2q: string; t2n: string; t2m: string; t3q: string; t3n: string; t3m: string;
    ctaTitle: string; ctaText: string; ctaStart: string;
  };
  services: { eyebrow: string; title: string; sub: string; typical: string; explore: string };
  serviceDetail: {
    back: string; duration: string; choose: string; chooseSub: string; extras: string; upTo: string;
    estimatedTotal: string; add: string; added: string; goToBooking: string; noPackages: string;
  };
  booking: {
    eyebrow: string; title: string; sub: string;
    step1: string; step2: string; step3: string;
    emptyTitle: string; emptyText: string;
    whenTitle: string; dateLabel: string; checking: string; available: string; unavailable: string; chooseAnother: string;
    timeLabel: string; hoursNote: string; noSlots: string;
    addressLabel: string; addressPlaceholder: string;
    whoTitle: string; firstName: string; lastName: string; phone: string; email: string; notes: string; notesPlaceholder: string;
    submit: string; submitting: string; disclaimer: string;
    yourBooking: string; items: string; recalculated: string;
  };
  confirmation: {
    received: string; thanks: string; holdNote: string; noHoldNote: string;
    submitted: string; review: string; inProgress: string; confirmedStep: string; contacted: string;
    allDay: string; servicesCount: string; backHome: string; addressLabel: string;
  };
  contact: {
    eyebrow: string; title: string; sub: string; fastest: string; fastestText: string;
    phone: string; email: string; whatsapp: string; instagram: string; location: string; hours: string;
  };
  about: { eyebrow: string; title: string; ready: string; readyCta: string };
  gallery: { eyebrow: string; title: string; sub: string; likeTitle: string; likeText: string; start: string };
  notFound: { title: string; text: string; back: string };
}

export const dictionaries: Record<Locale, Dict> = {
  en: {
    dir: "ltr",
    langLabel: "Language",
    nav: { home: "Home", services: "Services", gallery: "Gallery", about: "About", contact: "Contact" },
    common: { bookNow: "Book Now", viewServices: "View Services", cart: "Cart", from: "From", packages: "packages", total: "Total", remove: "Remove" },
    footer: { explore: "Explore", contact: "Contact", visit: "Visit", rights: "All rights reserved", reviewed: "Requests are reviewed and confirmed by the studio" },
    home: {
      ctaServices: "View Services", ctaCheckDate: "Check a date", replyWithin: "Reply within 24h", clients: "Happy clients", projects: "Projects delivered",
      whatWeDo: "What we do", servicesTitle: "Services & packages", allServices: "All services",
      howTitle: "How booking works", howSub: "No payment upfront. You request, we review, everyone is happy.",
      how1t: "1 · Build your order", how1d: "Pick a service, compare packages and add the extras you want.",
      how2t: "2 · Request a date", how2d: "Choose an available date and send your booking request in seconds.",
      how3t: "3 · We confirm", how3d: "The studio reviews every request and confirms with you personally.",
      portfolio: "Portfolio", recentWork: "Recent work", fullGallery: "Full gallery",
      kindWords: "Kind words",
      t1q: "They captured our day perfectly. The booking process was the easiest part of the whole planning.", t1n: "Amina B.", t1m: "Wedding, June 2026",
      t2q: "Our catalog shots doubled conversions. Professional studio, zero hassle from booking to delivery.", t2n: "Karim D.", t2m: "Product shoot",
      t3q: "Warm, patient and incredibly talented. We got our photos back in days, not weeks.", t3n: "Sofia M.", t3m: "Family portraits",
      ctaTitle: "Your date might go fast.", ctaText: "We take a limited number of bookings per day. Check availability now — it takes 30 seconds.", ctaStart: "Start your booking",
    },
    services: { eyebrow: "Services", title: "Find the right experience", sub: "Every service comes with clear packages and optional extras. Build your order, check a date, and send a request — no payment needed.", typical: "typical", explore: "Explore" },
    serviceDetail: {
      back: "All services", duration: "Typical duration", choose: "Choose a package", chooseSub: "Select the option that fits — you can change extras below.",
      extras: "Optional extras", upTo: "up to {n}×", estimatedTotal: "Estimated total", add: "Add to cart", added: "Added ·", goToBooking: "go to booking", noPackages: "No packages available yet.",
    },
    booking: {
      eyebrow: "Booking request", title: "Almost there", sub: "Pick a date, tell us who you are, and send your request. We review every booking personally — nothing is charged and nothing is confirmed automatically.",
      step1: "Build order", step2: "Date & details", step3: "Confirmation",
      emptyTitle: "Your cart is empty", emptyText: "Browse services and add a package to start a booking.",
      whenTitle: "When do you need us?", dateLabel: "Preferred date *", checking: "Checking availability…", available: "This date is available.", unavailable: "This date is unavailable.", chooseAnother: "Please choose another date.",
      timeLabel: "Start time *", hoursNote: "Working hours: {open} – {close}", noSlots: "No time slots available for this duration on this date.",
      addressLabel: "Event address *", addressPlaceholder: "Full address, city, neighborhood…",
      whoTitle: "Who are we booking for?", firstName: "First name *", lastName: "Last name *", phone: "Phone *", email: "Email", notes: "Special notes", notesPlaceholder: "I would like the session to start around 4 PM.",
      submit: "Submit booking request", submitting: "Submitting…", disclaimer: "Nothing is charged and nothing is confirmed automatically — the studio reviews every request.",
      yourBooking: "Your booking", items: "item(s)", recalculated: "Final price is recalculated on the server when you submit.",
    },
    confirmation: {
      received: "Request received", thanks: "Thanks, {name}! The studio will review your request and contact you within 24 hours to confirm.",
      holdNote: "This date is reserved for you for the next {h} hours.", noHoldNote: "The date is not reserved until confirmed.",
      submitted: "Request submitted", review: "Studio review", inProgress: "— in progress", confirmedStep: "Confirmation", contacted: "You will be contacted by phone or email.",
      allDay: "all day", servicesCount: "service(s)", backHome: "Back to home", addressLabel: "Event address",
    },
    contact: {
      eyebrow: "Get in touch", title: "Contact", sub: "Prefer to talk to a human? Reach us directly — or skip the small talk and check a date.",
      fastest: "The fastest way is to just book.", fastestText: "Check availability and send a request in under a minute.",
      phone: "Phone", email: "Email", whatsapp: "WhatsApp", instagram: "Instagram", location: "Location", hours: "Business hours",
    },
    about: { eyebrow: "Our story", title: "About {name}", ready: "Ready when you are.", readyCta: "Explore services" },
    gallery: { eyebrow: "Portfolio", title: "Gallery", sub: "A selection of our recent work across weddings, portraits, products and events.", likeTitle: "Like what you see?", likeText: "Check availability and send a request — it takes less than a minute.", start: "Start your booking" },
    notFound: { title: "This page is out of focus", text: "The page you were looking for doesn't exist or has been moved.", back: "Back to home" },
  },
  fr: {
    dir: "ltr",
    langLabel: "Langue",
    nav: { home: "Accueil", services: "Services", gallery: "Galerie", about: "À propos", contact: "Contact" },
    common: { bookNow: "Réserver", viewServices: "Voir les services", cart: "Panier", from: "À partir de", packages: "formules", total: "Total", remove: "Retirer" },
    footer: { explore: "Navigation", contact: "Contact", visit: "Nous trouver", rights: "Tous droits réservés", reviewed: "Les demandes sont examinées et confirmées par le studio" },
    home: {
      ctaServices: "Voir les services", ctaCheckDate: "Vérifier une date", replyWithin: "Réponse sous 24h", clients: "clients satisfaits", projects: "projets réalisés",
      whatWeDo: "Nos prestations", servicesTitle: "Services & formules", allServices: "Tous les services",
      howTitle: "Comment ça marche", howSub: "Aucun paiement à l'avance. Vous demandez, nous validons.",
      how1t: "1 · Composez votre commande", how1d: "Choisissez un service, comparez les formules et ajoutez vos options.",
      how2t: "2 · Réservez une date", how2d: "Sélectionnez une date disponible et envoyez votre demande en quelques secondes.",
      how3t: "3 · Nous confirmons", how3d: "Le studio examine chaque demande et vous confirme personnellement.",
      portfolio: "Portfolio", recentWork: "Réalisations récentes", fullGallery: "Toute la galerie",
      kindWords: "Témoignages",
      t1q: "Ils ont capturé notre journée à la perfection. La réservation a été la partie la plus simple de toute l'organisation.", t1n: "Amina B.", t1m: "Mariage, juin 2026",
      t2q: "Nos photos produit ont doublé les conversions. Studio professionnel, zéro tracas de la réservation à la livraison.", t2n: "Karim D.", t2m: "Shooting produit",
      t3q: "Chaleureux, patients et incroyablement talentueux. Photos reçues en quelques jours.", t3n: "Sofia M.", t3m: "Portraits en famille",
      ctaTitle: "Votre date partira vite.", ctaText: "Nous prenons un nombre limité de réservations par jour. Vérifiez les disponibilités — 30 secondes suffisent.", ctaStart: "Commencer votre réservation",
    },
    services: { eyebrow: "Services", title: "Trouvez l'expérience qu'il vous faut", sub: "Chaque service propose des formules claires et des options. Composez, vérifiez la date et envoyez — sans paiement.", typical: "typique", explore: "Découvrir" },
    serviceDetail: {
      back: "Tous les services", duration: "Durée typique", choose: "Choisissez une formule", chooseSub: "Sélectionnez l'option qui vous convient — vous pourrez ajouter des options ci-dessous.",
      extras: "Options", upTo: "jusqu'à {n}×", estimatedTotal: "Total estimé", add: "Ajouter au panier", added: "Ajouté ·", goToBooking: "aller à la réservation", noPackages: "Aucune formule disponible pour le moment.",
    },
    booking: {
      eyebrow: "Demande de réservation", title: "Presque terminé", sub: "Choisissez une date, indiquez vos coordonnées et envoyez votre demande. Nous examinons chaque réservation personnellement — rien n'est facturé ni confirmé automatiquement.",
      step1: "Composez", step2: "Date & détails", step3: "Confirmation",
      emptyTitle: "Votre panier est vide", emptyText: "Parcourez les services et ajoutez une formule pour commencer.",
      whenTitle: "Quand avez-vous besoin de nous ?", dateLabel: "Date souhaitée *", checking: "Vérification…", available: "Cette date est disponible.", unavailable: "Cette date n'est pas disponible.", chooseAnother: "Veuillez choisir une autre date.",
      timeLabel: "Heure de début *", hoursNote: "Horaires : {open} – {close}", noSlots: "Aucune plage horaire disponible pour cette durée.",
      addressLabel: "Adresse de l'événement *", addressPlaceholder: "Adresse complète, ville, quartier…",
      whoTitle: "Pour qui réservons-nous ?", firstName: "Prénom *", lastName: "Nom *", phone: "Téléphone *", email: "E-mail", notes: "Remarques", notesPlaceholder: "J'aimerais que la séance commence vers 16h.",
      submit: "Envoyer la demande", submitting: "Envoi…", disclaimer: "Rien n'est facturé et rien n'est confirmé automatiquement — le studio examine chaque demande.",
      yourBooking: "Votre réservation", items: "article(s)", recalculated: "Le prix final est recalculé côté serveur à l'envoi.",
    },
    confirmation: {
      received: "Demande reçue", thanks: "Merci {name} ! Le studio examine votre demande et vous contactera sous 24h pour confirmer.",
      holdNote: "Cette date est réservée pour vous pendant les {h} prochaines heures.", noHoldNote: "La date n'est réservée qu'après confirmation.",
      submitted: "Demande envoyée", review: "Examen du studio", inProgress: "— en cours", confirmedStep: "Confirmation", contacted: "Vous serez contacté par téléphone ou e-mail.",
      allDay: "Journée", servicesCount: "service(s)", backHome: "Retour à l'accueil", addressLabel: "Adresse de l'événement",
    },
    contact: {
      eyebrow: "Prendre contact", title: "Contact", sub: "Vous préférez parler à un humain ? Contactez-nous — ou vérifiez directement une date.",
      fastest: "Le plus rapide est de réserver.", fastestText: "Vérifiez les disponibilités et envoyez une demande en moins d'une minute.",
      phone: "Téléphone", email: "E-mail", whatsapp: "WhatsApp", instagram: "Instagram", location: "Lieu", hours: "Horaires",
    },
    about: { eyebrow: "Notre histoire", title: "À propos de {name}", ready: "Prêts quand vous l'êtes.", readyCta: "Découvrir les services" },
    gallery: { eyebrow: "Portfolio", title: "Galerie", sub: "Une sélection de nos récentes réalisations.", likeTitle: "Vous aimez notre travail ?", likeText: "Vérifiez les disponibilités et envoyez une demande — moins d'une minute.", start: "Commencer votre réservation" },
    notFound: { title: "Cette page est floue", text: "La page recherchée n'existe pas ou a été déplacée.", back: "Retour à l'accueil" },
  },
  ar: {
    dir: "rtl",
    langLabel: "اللغة",
    nav: { home: "الرئيسية", services: "الخدمات", gallery: "المعرض", about: "من نحن", contact: "اتصل بنا" },
    common: { bookNow: "احجز الآن", viewServices: "عرض الخدمات", cart: "السلة", from: "ابتداءً من", packages: "باقات", total: "المجموع", remove: "إزالة" },
    footer: { explore: "روابط", contact: "التواصل", visit: "زورونا", rights: "جميع الحقوق محفوظة", reviewed: "الطلبات تُراجع وتُؤكد من طرف الاستوديو" },
    home: {
      ctaServices: "عرض الخدمات", ctaCheckDate: "تحقق من تاريخ", replyWithin: "رد خلال 24 ساعة", clients: "عميل سعيد", projects: "مشروع منجز",
      whatWeDo: "خدماتنا", servicesTitle: "الخدمات والباقات", allServices: "كل الخدمات",
      howTitle: "كيف تتم الحجز", howSub: "لا دفع مسبق. أنت تطلب ونحن نؤكد.",
      how1t: "١ · اختر طلبك", how1d: "اختر الخدمة، قارن الباقات وأضف الخيارات الإضافية التي تريدها.",
      how2t: "٢ · اختر التاريخ", how2d: "حدد تاريخًا متاحًا وأرسل طلب الحجز في ثوانٍ.",
      how3t: "٣ · نؤكد الحجز", how3d: "يراجع الاستوديو كل طلب ويؤكد لك شخصيًا.",
      portfolio: "أعمالنا", recentWork: "أحدث الأعمال", fullGallery: "المعرض الكامل",
      kindWords: "آراء العملاء",
      t1q: "التقطوا أهم لحظاتنا بإتقان. كانت عملية الحجز أسهل جزء في كل التحضيرات.", t1n: "أمينة ب.", t1m: "زفاف، جوان 2026",
      t2q: "صور منتجاتنا ضاعفت المبيعات. استوديو محترف وصفر متاعب من الحجز إلى التسليم.", t2n: "كريم د.", t2m: "تصوير منتجات",
      t3q: "دودئون، صبورون وموهوبون للغاية. استلمنا الصور في أيام لا أسابيع.", t3n: "صوفيا م.", t3m: "صور عائلية",
      ctaTitle: "قد ينفد تاريخك بسرعة.", ctaText: "نستقبل عددًا محدودًا من الحجوزات يوميًا. تحقق من التوفر الآن — لن يستغرق أكثر من 30 ثانية.", ctaStart: "ابدأ حجزك",
    },
    services: { eyebrow: "الخدمات", title: "اعثر على التجربة المناسبة", sub: "كل خدمة تتضمن باقات واضحة وخيارات إضافية. أنشئ طلبك، تحقق من التاريخ وأرسل — بدون دفع.", typical: "عادةً", explore: "اكتشف" },
    serviceDetail: {
      back: "كل الخدمات", duration: "المدة المعتادة", choose: "اختر باقة", chooseSub: "اختر ما يناسبك — يمكنك إضافة خيارات أدناه.",
      extras: "خيارات إضافية", upTo: "حتى {n}×", estimatedTotal: "المجموع التقديري", add: "أضف إلى السلة", added: "تمت الإضافة ·", goToBooking: "اذهب إلى الحجز", noPackages: "لا توجد باقات متاحة حاليًا.",
    },
    booking: {
      eyebrow: "طلب حجز", title: "اقتربنا", sub: "اختر التاريخ، أدخل بياناتك وأرسل طلبك. نراجع كل حجز شخصيًا — لا شيء يُدفع ولا يُؤكد تلقائيًا.",
      step1: "الاختيار", step2: "التاريخ والتفاصيل", step3: "التأكيد",
      emptyTitle: "سلتك فارغة", emptyText: "تصفح الخدمات وأضف باقة لبدء الحجز.",
      whenTitle: "متى تحتاجنا؟", dateLabel: "التاريخ المفضل *", checking: "جارٍ التحقق…", available: "هذا التاريخ متاح.", unavailable: "هذا التاريخ غير متاح.", chooseAnother: "يرجى اختيار تاريخ آخر.",
      timeLabel: "وقت البداية *", hoursNote: "أوقات العمل: {open} – {close}", noSlots: "لا توجد فترات متاحة لهذه المدة.",
      addressLabel: "عنوان الفعالية *", addressPlaceholder: "العنوان الكامل، المدينة، الحي…",
      whoTitle: "لمن الحجز؟", firstName: "الاسم *", lastName: "اللقب *", phone: "الهاتف *", email: "البريد الإلكتروني", notes: "ملاحظات", notesPlaceholder: "أود أن تبدأ الجلسة حوالي الساعة 4 مساءً.",
      submit: "إرسال طلب الحجز", submitting: "جارٍ الإرسال…", disclaimer: "لا شيء يُدفع ولا يُؤكد تلقائيًا — يراجع الاستوديو كل طلب.",
      yourBooking: "حجزك", items: "عنصر", recalculated: "يُعاد حساب السعر النهائي على الخادم عند الإرسال.",
    },
    confirmation: {
      received: "تم استلام الطلب", thanks: "شكرًا {name}! سيراجع الاستوديو طلبك ويتواصل معك خلال 24 ساعة للتأكيد.",
      holdNote: "هذا التاريخ محجوز لك خلال الـ {h} ساعة القادمة.", noHoldNote: "لا يُحجز التاريخ إلا بعد التأكيد.",
      submitted: "أُرسل الطلب", review: "مراجعة الاستوديو", inProgress: "— جارٍ", confirmedStep: "التأكيد", contacted: "سيتم التواصل معك هاتفيًا أو بالبريد.",
      allDay: "يوم كامل", servicesCount: "خدمة", backHome: "العودة إلى الرئيسية", addressLabel: "عنوان الفعالية",
    },
    contact: {
      eyebrow: "تواصل معنا", title: "اتصل بنا", sub: "تفضل التحدث مع شخص؟ تواصل معنا مباشرة — أو تحقق من تاريخ الآن.",
      fastest: "أسرع طريقة هي الحجز.", fastestText: "تحقق من التوفر وأرسل طلبًا في أقل من دقيقة.",
      phone: "الهاتف", email: "البريد الإلكتروني", whatsapp: "واتساب", instagram: "إنستغرام", location: "الموقع", hours: "ساعات العمل",
    },
    about: { eyebrow: "قصتنا", title: "عن {name}", ready: "جاهزون متى كنت.", readyCta: "استكشف الخدمات" },
    gallery: { eyebrow: "أعمالنا", title: "المعرض", sub: "تشكيلة من أحدث أعمالنا.", likeTitle: "أعجبك عملنا؟", likeText: "تحقق من التوفر وأرسل طلبًا — أقل من دقيقة.", start: "ابدأ حجزك" },
    notFound: { title: "هذه الصفحة خارج التركيز", text: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", back: "العودة إلى الرئيسية" },
  },
};

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
