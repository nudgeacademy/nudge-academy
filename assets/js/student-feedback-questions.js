// Shared by student-feedback.html (form) and student-feedback-admin.html (dashboard)

export const firebaseConfig = {
  apiKey: "AIzaSyDnSEUKCzaWuh350K2UG3BpWvUblZ_vrTs",
  authDomain: "nudge-fellowship.firebaseapp.com",
  projectId: "nudge-fellowship",
  storageBucket: "nudge-fellowship.firebasestorage.app",
  messagingSenderId: "522945610876",
  appId: "1:522945610876:web:d65d745c3798a7d288f5f9",
  measurementId: "G-62XLV5VTM0"
};

export const COLLECTION = "studentFeedback";

export const DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki",
  "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
  "Outside Kerala"
];

// type: single | multi | fields | text
// cond: only asked when it returns true
// exclusive: picking this option clears the others (multi only)
// r: goat reaction when picked (hype | sad), say: what the goat says back
export const QUESTIONS = [
  {
    id: "intro", section: "Hey 👋", type: "fields",
    goat: "Yo! Njan Nudge-inte GOAT 🐐 Oru quick vibe check aanu, 2 minute polum venda. Aadyam, nee aara?",
    q: "Ninte peru parayamo?",
    fields: [
      { k: "name", label: "Peru", ph: "Eg: Aisha", required: true },
      { k: "phone", label: "Phone number", ph: "10 digit number", type: "tel", required: true }
    ]
  },

  // 1. Course Experience
  {
    id: "classesFeel", section: "Course Experience", type: "single",
    goat: "Sheri, straight to the point. Classes okke engane pokunnu? Be honest, njan judge cheyyilla 😌",
    q: "So far classes engane und?",
    options: [
      { v: "adipoli", e: "🔥", t: "Adipoli, full vibe", r: "hype", say: "Lessgooo! 🔥 Athaanu njan kelkkan aagrahichath." },
      { v: "good", e: "🙂", t: "Kozhappamilla, nallathaanu" },
      { v: "average", e: "😐", t: "Average, okay-ish" },
      { v: "bad", e: "😕", t: "Sheriyaavunnilla", r: "sad", say: "Ayyo 🥺 Thanks for being honest. Namukk ithu sheriyaakkam, promise." }
    ]
  },
  {
    id: "pressure", section: "Course Experience", type: "single",
    goat: "Classes attend cheyyumbol pressure feel aakunnundo? No cap, sathyam para 🧢",
    q: "Classes attend cheyyumbol pressure undo?",
    options: [
      { v: "none", e: "😎", t: "Illa, full chill", r: "hype", say: "Chill GOAT energy 😎 Respect." },
      { v: "some", e: "😅", t: "Kurach okke und" },
      { v: "high", e: "🥵", t: "Nalla pressure aanu", r: "sad", say: "Hey, breathe 🫶 Nee otta-k alla, nammal und koode." }
    ]
  },
  {
    id: "balance", section: "Course Experience", type: "single",
    goat: "School/college um course um orumich kond pokunnath oru side quest thanne aanu. Engane manage cheyyunnu?",
    q: "Studies-um course-um balance cheyyaan pattunnundo?",
    options: [
      { v: "easy", e: "⚖️", t: "Easy aayi balance cheyyunnu", r: "hype", say: "Multitasking king/queen 👑" },
      { v: "struggle", e: "🤹", t: "Kurach struggle aanu" },
      { v: "no", e: "😵‍💫", t: "Pattunnilla, tough aanu", r: "sad", say: "Totally valid 🫂 Oru study plan vech namukk help cheyyam." }
    ]
  },
  {
    id: "attendance", section: "Course Experience", type: "single",
    goat: "Attendance check! Classes regular aayi kerunnundo? 👀",
    q: "Classes regular aayi attend cheyyaan pattunnundo?",
    options: [
      { v: "always", e: "💯", t: "Ellaa classum keraarund", r: "hype", say: "100% attendance?! Certified GOAT 🐐" },
      { v: "mostly", e: "👍", t: "Mostly keraarund" },
      { v: "sometimes", e: "🤏", t: "Idakk miss aakum" },
      { v: "rarely", e: "🙈", t: "Kooduthalum miss aakum", r: "sad", say: "No judgement 🙏 Enthaa reason enn adutha question-il parayaamo?" }
    ]
  },
  {
    id: "difficulties", section: "Course Experience", type: "multi",
    goat: "Enthenkilum issues undenkil para, namukk fix cheyyam 🛠️ Ethra venelum select cheyyam.",
    q: "Classes-il enthenkilum difficulties undo?",
    options: [
      { v: "none", e: "✅", t: "Onnumilla, ellam smooth", exclusive: true, r: "hype" },
      { v: "network", e: "📶", t: "Network / internet issue" },
      { v: "time", e: "⏰", t: "Class time sheriyaavunnilla" },
      { v: "understanding", e: "🤯", t: "Topics manassilaakunnilla" },
      { v: "pace", e: "🏃", t: "Class speed kooduthal aanu" },
      { v: "device", e: "📱", t: "Phone / laptop illa" }
    ]
  },
  {
    id: "improve", section: "Course Experience", type: "multi", optional: true,
    goat: "Ninakk director aakaan chance kittiyaal, course-il enth change cheyyum? 🎬",
    q: "Course-il enth improve cheyyanam?",
    options: [
      { v: "doubts", e: "🙋", t: "Kooduthal doubt sessions" },
      { v: "recordings", e: "🎥", t: "Class recordings" },
      { v: "tests", e: "📝", t: "Kooduthal practice tests" },
      { v: "notes", e: "📄", t: "Better notes / materials" },
      { v: "slower", e: "🐢", t: "Kurach slow aakkanam" },
      { v: "perfect", e: "🐐", t: "Onnum venda, perfect aanu", exclusive: true, r: "hype", say: "Aww, njan blush cheyyunnu 🥹" }
    ]
  },

  // 2. Family Details
  {
    id: "familyMembers", section: "Family Details", type: "single", grid: true,
    goat: "Ini kurach about you. Veettil ethra per und? (Ninne koottiyitt) 🏠",
    q: "Family-il ethra members und?",
    options: [
      { v: "2", t: "2" }, { v: "3", t: "3" }, { v: "4", t: "4" },
      { v: "5", t: "5" }, { v: "6", t: "6" }, { v: "7+", t: "7+" }
    ]
  },
  {
    id: "home", section: "Family Details", type: "fields",
    goat: "Nee evidunnaa? Just curious, njan veettil varilla, promise 😂",
    q: "Ninte veed evideyaanu?",
    fields: [
      { k: "place", label: "Place / Panchayat / Municipality", ph: "Eg: Kondotty", required: true },
      { k: "district", label: "District", type: "select", options: DISTRICTS, required: true },
      { k: "constituency", label: "Assembly Constituency", ph: "Eg: Kondotty", required: false }
    ]
  },

  // 3. School Details
  {
    id: "school", section: "School Details", type: "fields",
    goat: "School days! Nee padicha school-inte peru entha? 🏫",
    q: "School-inte peru?",
    fields: [
      { k: "schoolName", label: "School name", ph: "Eg: GHSS Kondotty", required: true }
    ]
  },
  {
    id: "streams", section: "School Details", type: "multi",
    goat: "Ninte school-il ethokke streams undaayirunnu? Ullath okke tap cheyyu 👇",
    q: "School-il ethokke streams available aayirunnu?",
    options: [
      { v: "science", e: "🔬", t: "Science" },
      { v: "commerce", e: "💼", t: "Commerce" },
      { v: "humanities", e: "🌍", t: "Humanities" },
      { v: "other", e: "✨", t: "Other" }
    ]
  },
  {
    id: "passoutYear", section: "School Details", type: "single", grid: true,
    goat: "Ninte batch eth aanu? Pass-out year (or pass aakunna year) select cheyyu 🎓",
    q: "School batch / pass-out year?",
    options: [
      { v: "2023", t: "2023" }, { v: "2024", t: "2024" }, { v: "2025", t: "2025" },
      { v: "2026", t: "2026" }, { v: "2027", t: "2027" }, { v: "2028", t: "2028" }
    ]
  },
  {
    id: "coachingProvided", section: "School Details", type: "single",
    goat: "School-il entrance exam coaching undaayirunno? 🎯",
    q: "School-il entrance coaching provide cheythirunno?",
    options: [
      { v: "yes", e: "👍", t: "Undaayirunnu" },
      { v: "no", e: "🙅", t: "Illaayirunnu" }
    ]
  },
  {
    id: "coachingExams", section: "School Details", type: "multi",
    cond: a => a.coachingProvided === "yes",
    goat: "Ooh nice! Ethokke exams-inu aayirunnu coaching? 📖",
    q: "Ethokke exams-inulla coaching aayirunnu?",
    options: [
      { v: "cuet", e: "🎓", t: "CUET" },
      { v: "neet", e: "🩺", t: "NEET" },
      { v: "jee", e: "⚙️", t: "JEE" },
      { v: "other", e: "✨", t: "Other" }
    ]
  },
  {
    id: "coachingFee", section: "School Details", type: "single",
    cond: a => a.coachingProvided === "yes",
    goat: "Last school question! Aa coaching free aayirunno? 💸",
    q: "Coaching free aayirunno, atho fees undaayirunno?",
    options: [
      { v: "free", e: "🆓", t: "Free aayirunnu" },
      { v: "paid", e: "💰", t: "Fees undaayirunnu" }
    ]
  },

  // 4. Additional Feedback
  {
    id: "supportNeeded", section: "Additional Feedback", type: "single",
    goat: "Almost done! Course manage cheyyaan enthenkilum extra support venamo? Nammal und 🤝",
    q: "Additional support enthenkilum venamo?",
    options: [
      { v: "no", e: "💪", t: "Venda, njan manage cheyyum" },
      { v: "yes", e: "🙌", t: "Venam", say: "Good call 🤝 Help chodikkunnath GOAT move aanu." }
    ]
  },
  {
    id: "supportTypes", section: "Additional Feedback", type: "multi",
    cond: a => a.supportNeeded === "yes",
    goat: "Sheri! Enth type support aanu venda? 👇",
    q: "Ethu type support aanu venda?",
    options: [
      { v: "mentoring", e: "🧭", t: "Personal mentoring" },
      { v: "doubts", e: "🙋", t: "Doubt clearing" },
      { v: "studyPlan", e: "🗂️", t: "Study plan / time table" },
      { v: "device", e: "📱", t: "Device / internet" },
      { v: "financial", e: "💵", t: "Financial support" },
      { v: "motivation", e: "🔋", t: "Motivation / stress" }
    ]
  },
  {
    id: "feedback", section: "Additional Feedback", type: "text", optional: true,
    goat: "Final boss level 🏁 Enthenkilum suggestions, feedback, or just vibes? Free aayi ezhuthikko. Skip cheyyaanum pattum.",
    q: "Suggestions / feedback undo?",
    ph: "Ivide type cheyyu..."
  }
];

// Flat list of answer keys (field ids expanded) with labels, for the admin page
export function answerColumns() {
  const cols = [];
  for (const q of QUESTIONS) {
    if (q.type === "fields") q.fields.forEach(f => cols.push({ k: f.k, label: f.label, q }));
    else cols.push({ k: q.id, label: q.q, q });
  }
  return cols;
}

export function labelFor(q, v) {
  if (!q.options) return v;
  const o = q.options.find(o => o.v === v);
  return o ? o.t : v;
}
