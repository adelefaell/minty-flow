import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import type { ComponentProps } from "react"

/**
 * Type for valid icon names from MaterialCommunityIcons
 */
type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"]

/**
 * Icon data structure with name and searchable keywords
 */
export type MintyIconData = {
  name: MaterialIconName
  keywords: string[]
}

/**
 * Material Symbols Icons - Common symbols useful for finance apps
 * All icon names are typed and validated against MaterialCommunityIcons
 */
export const MATERIAL_SYMBOLS: MintyIconData[] = [
  // Money & Finance
  {
    name: "wallet",

    keywords: ["money", "cash", "payment"],
  },
  {
    name: "wallet-outline",

    keywords: ["money", "cash", "payment"],
  },
  {
    name: "credit-card",

    keywords: ["payment", "card", "credit"],
  },
  {
    name: "credit-card-outline",

    keywords: ["payment", "card", "credit"],
  },
  {
    name: "bank",

    keywords: ["banking", "finance", "institution"],
  },
  {
    name: "bank-outline",

    keywords: ["banking", "finance", "institution"],
  },
  {
    name: "cash",

    keywords: ["money", "payment", "dollar"],
  },
  {
    name: "cash-multiple",

    keywords: ["money", "payment", "dollar"],
  },
  {
    name: "currency-usd",

    keywords: ["dollar", "money", "usd"],
  },
  {
    name: "currency-eur",

    keywords: ["euro", "money", "eur"],
  },
  {
    name: "currency-gbp",

    keywords: ["pound", "money", "gbp"],
  },
  {
    name: "currency-jpy",

    keywords: ["yen", "money", "jpy"],
  },
  {
    name: "chart-line",

    keywords: ["graph", "analytics", "trend"],
  },
  {
    name: "chart-bar",

    keywords: ["graph", "analytics", "statistics"],
  },
  {
    name: "chart-pie",

    keywords: ["graph", "analytics", "distribution"],
  },
  {
    name: "trending-up",

    keywords: ["growth", "increase", "profit"],
  },
  {
    name: "trending-down",

    keywords: ["loss", "decrease", "decline"],
  },
  {
    name: "piggy-bank",

    keywords: ["savings", "save", "money"],
  },
  {
    name: "piggy-bank-outline",

    keywords: ["savings", "save", "money"],
  },
  {
    name: "safe",

    keywords: ["secure", "vault", "protection"],
  },
  {
    name: "receipt",

    keywords: ["bill", "invoice", "payment"],
  },
  {
    name: "receipt-text",

    keywords: ["bill", "invoice", "payment"],
  },
  {
    name: "invoice",

    keywords: ["bill", "receipt", "payment"],
  },
  {
    name: "cash-register",

    keywords: ["payment", "pos", "store"],
  },
  {
    name: "percent",

    keywords: ["discount", "tax", "rate"],
  },
  {
    name: "tag",

    keywords: ["label", "category", "price"],
  },
  {
    name: "tag-outline",

    keywords: ["label", "category", "price"],
  },
  {
    name: "tag-multiple",

    keywords: ["labels", "categories", "tags"],
  },
  {
    name: "tag-multiple-outline",

    keywords: ["labels", "categories", "tags"],
  },

  // Shopping & Stores
  {
    name: "cart",

    keywords: ["shopping", "buy", "purchase"],
  },
  {
    name: "cart-outline",

    keywords: ["shopping", "buy", "purchase"],
  },
  {
    name: "shopping",

    keywords: ["bag", "buy", "purchase"],
  },
  {
    name: "shopping-outline",

    keywords: ["bag", "buy", "purchase"],
  },
  {
    name: "store",

    keywords: ["shop", "retail", "business"],
  },
  {
    name: "store-outline",

    keywords: ["shop", "retail", "business"],
  },
  {
    name: "basket",

    keywords: ["shopping", "groceries", "buy"],
  },
  {
    name: "basket-outline",

    keywords: ["shopping", "groceries", "buy"],
  },
  {
    name: "barcode",

    keywords: ["scan", "product", "code"],
  },
  {
    name: "qrcode",

    keywords: ["scan", "code", "digital"],
  },

  // Food & Dining
  {
    name: "food",

    keywords: ["dining", "meal", "restaurant"],
  },
  {
    name: "food-outline",

    keywords: ["dining", "meal", "restaurant"],
  },
  {
    name: "silverware-fork-knife",

    keywords: ["dining", "restaurant", "meal"],
  },
  {
    name: "coffee",

    keywords: ["cafe", "drink", "beverage"],
  },
  {
    name: "coffee-outline",

    keywords: ["cafe", "drink", "beverage"],
  },
  {
    name: "hamburger",

    keywords: ["food", "fast-food", "meal"],
  },
  {
    name: "pizza",

    keywords: ["food", "dining", "meal"],
  },
  {
    name: "noodles",

    keywords: ["food", "pasta", "meal"],
  },
  {
    name: "rice",

    keywords: ["food", "grain", "meal"],
  },
  {
    name: "fish",

    keywords: ["food", "seafood", "meal"],
  },
  {
    name: "cupcake",

    keywords: ["dessert", "sweet", "food"],
  },
  {
    name: "cake",

    keywords: ["dessert", "sweet", "food"],
  },
  {
    name: "ice-cream",

    keywords: ["dessert", "sweet", "food"],
  },
  {
    name: "glass-wine",

    keywords: ["drink", "alcohol", "beverage"],
  },
  {
    name: "bottle-soda",

    keywords: ["drink", "beverage", "soda"],
  },

  // Transportation
  {
    name: "car",

    keywords: ["vehicle", "transport", "auto"],
  },
  {
    name: "car-outline",

    keywords: ["vehicle", "transport", "auto"],
  },
  {
    name: "bus",

    keywords: ["transport", "public", "transit"],
  },
  {
    name: "train",

    keywords: ["transport", "public", "transit"],
  },
  {
    name: "airplane",

    keywords: ["flight", "travel", "transport"],
  },
  {
    name: "taxi",

    keywords: ["cab", "transport", "ride"],
  },
  {
    name: "subway",

    keywords: ["metro", "transport", "transit"],
  },
  {
    name: "ferry",

    keywords: ["boat", "transport", "water"],
  },
  {
    name: "motorbike",

    keywords: ["motorcycle", "bike", "transport"],
  },
  {
    name: "bicycle",

    keywords: ["bike", "cycling", "transport"],
  },
  {
    name: "gas-station",

    keywords: ["fuel", "petrol", "gas"],
  },
  {
    name: "parking",

    keywords: ["car", "vehicle", "space"],
  },

  // Home & Living
  {
    name: "home",

    keywords: ["house", "residence", "property"],
  },
  {
    name: "home-outline",

    keywords: ["house", "residence", "property"],
  },
  {
    name: "bed",

    keywords: ["bedroom", "sleep", "furniture"],
  },
  {
    name: "sofa",

    keywords: ["couch", "furniture", "living-room"],
  },
  {
    name: "lamp",

    keywords: ["light", "furniture", "decor"],
  },
  {
    name: "fridge",

    keywords: ["refrigerator", "appliance", "kitchen"],
  },
  {
    name: "fridge-outline",

    keywords: ["refrigerator", "appliance", "kitchen"],
  },
  {
    name: "washing-machine",

    keywords: ["laundry", "appliance", "clean"],
  },
  {
    name: "broom",

    keywords: ["cleaning", "housework", "clean"],
  },
  {
    name: "door",

    keywords: ["entrance", "exit", "home"],
  },
  {
    name: "window-closed",

    keywords: ["glass", "home", "room"],
  },

  // Utilities & Bills
  {
    name: "power-plug",

    keywords: ["electricity", "energy", "utility"],
  },
  {
    name: "power-socket",

    keywords: ["electricity", "energy", "outlet"],
  },
  {
    name: "lightning-bolt",

    keywords: ["electricity", "power", "energy"],
  },
  {
    name: "water",

    keywords: ["utility", "bill", "liquid"],
  },
  {
    name: "fire",

    keywords: ["heat", "gas", "utility"],
  },
  {
    name: "cellphone",

    keywords: ["phone", "mobile", "communication"],
  },
  {
    name: "phone",

    keywords: ["telephone", "call", "communication"],
  },
  {
    name: "wifi",

    keywords: ["internet", "wireless", "connection"],
  },
  {
    name: "router-wireless",

    keywords: ["internet", "network", "wifi"],
  },
  {
    name: "television",

    keywords: ["tv", "entertainment", "media"],
  },

  // Health & Wellness
  {
    name: "hospital",

    keywords: ["medical", "health", "care"],
  },
  {
    name: "hospital-box",

    keywords: ["medical", "health", "care"],
  },
  {
    name: "medical-bag",

    keywords: ["health", "medicine", "care"],
  },
  {
    name: "pill",

    keywords: ["medicine", "drug", "pharmacy"],
  },
  {
    name: "heart",

    keywords: ["health", "love", "wellness"],
  },
  {
    name: "heart-outline",

    keywords: ["health", "love", "wellness"],
  },
  {
    name: "heart-pulse",

    keywords: ["health", "medical", "heartbeat"],
  },
  {
    name: "stethoscope",

    keywords: ["medical", "doctor", "health"],
  },
  {
    name: "needle",

    keywords: ["medical", "injection", "vaccine"],
  },
  {
    name: "bandage",

    keywords: ["medical", "injury", "first-aid"],
  },
  {
    name: "dumbbell",

    keywords: ["fitness", "exercise", "gym"],
  },
  {
    name: "run",

    keywords: ["fitness", "exercise", "sport"],
  },
  {
    name: "yoga",

    keywords: ["fitness", "exercise", "wellness"],
  },

  // Entertainment & Leisure
  {
    name: "movie",

    keywords: ["cinema", "film", "entertainment"],
  },
  {
    name: "theater",

    keywords: ["cinema", "entertainment", "show"],
  },
  {
    name: "music",

    keywords: ["song", "audio", "entertainment"],
  },
  {
    name: "headphones",

    keywords: ["audio", "music", "listen"],
  },
  {
    name: "microphone",

    keywords: ["audio", "recording", "music"],
  },
  {
    name: "gamepad",

    keywords: ["gaming", "controller", "play"],
  },
  {
    name: "controller-classic",

    keywords: ["gaming", "game", "play"],
  },
  {
    name: "dice-multiple",

    keywords: ["game", "gambling", "casino"],
  },
  {
    name: "cards",

    keywords: ["game", "playing", "poker"],
  },
  {
    name: "book",

    keywords: ["reading", "library", "education"],
  },
  {
    name: "book-open",

    keywords: ["reading", "library", "education"],
  },
  {
    name: "newspaper",

    keywords: ["news", "reading", "media"],
  },
  {
    name: "camera",

    keywords: ["photo", "photography", "picture"],
  },
  {
    name: "camera-outline",

    keywords: ["photo", "photography", "picture"],
  },
  {
    name: "party-popper",

    keywords: ["celebration", "party", "event"],
  },
  {
    name: "balloon",

    keywords: ["party", "celebration", "event"],
  },

  // Work & Business
  {
    name: "briefcase",

    keywords: ["work", "business", "office"],
  },
  {
    name: "briefcase-outline",

    keywords: ["work", "business", "office"],
  },
  {
    name: "office-building",

    keywords: ["work", "business", "corporate"],
  },
  {
    name: "office-building-outline",

    keywords: ["work", "business", "corporate"],
  },
  {
    name: "domain",

    keywords: ["business", "company", "organization"],
  },
  {
    name: "file-document",

    keywords: ["document", "paper", "file"],
  },
  {
    name: "file-document-outline",

    keywords: ["document", "paper", "file"],
  },
  {
    name: "clipboard",

    keywords: ["document", "notes", "list"],
  },
  {
    name: "clipboard-outline",

    keywords: ["document", "notes", "list"],
  },
  {
    name: "pencil",

    keywords: ["write", "edit", "draw"],
  },
  {
    name: "pen",

    keywords: ["write", "signature", "ink"],
  },
  {
    name: "printer",

    keywords: ["print", "document", "office"],
  },
  {
    name: "fax",

    keywords: ["document", "office", "communication"],
  },

  // Education
  {
    name: "school",

    keywords: ["education", "learning", "academy"],
  },
  {
    name: "school-outline",

    keywords: ["education", "learning", "academy"],
  },
  {
    name: "book-open-page-variant",

    keywords: ["study", "education", "learning"],
  },
  {
    name: "bag-personal",

    keywords: ["school", "student", "bag"],
  },
  {
    name: "pencil-box-outline",

    keywords: ["school", "supplies", "stationery"],
  },
  {
    name: "palette",

    keywords: ["art", "design", "creative"],
  },
  {
    name: "palette-outline",

    keywords: ["art", "design", "creative"],
  },

  // Gifts & Occasions
  {
    name: "gift",

    keywords: ["present", "surprise", "celebration"],
  },
  {
    name: "gift-outline",

    keywords: ["present", "surprise", "celebration"],
  },
  {
    name: "card",

    keywords: ["greeting", "gift-card", "voucher"],
  },
  {
    name: "balloon",

    keywords: ["party", "celebration", "birthday"],
  },
  {
    name: "cake-variant",

    keywords: ["birthday", "celebration", "party"],
  },

  // Subscriptions & Digital
  {
    name: "youtube",

    keywords: ["video", "streaming", "subscription"],
  },
  {
    name: "spotify",

    keywords: ["music", "streaming", "subscription"],
  },
  {
    name: "netflix",

    keywords: ["video", "streaming", "subscription"],
  },
  {
    name: "cloud",

    keywords: ["storage", "digital", "subscription"],
  },
  {
    name: "cloud-outline",

    keywords: ["storage", "digital", "subscription"],
  },
  {
    name: "calendar-clock",

    keywords: ["subscription", "recurring", "schedule"],
  },
  {
    name: "autorenew",

    keywords: ["recurring", "subscription", "repeat"],
  },
  {
    name: "repeat",

    keywords: ["recurring", "cycle", "loop"],
  },

  // Insurance & Protection
  {
    name: "shield",

    keywords: ["insurance", "protection", "security"],
  },
  {
    name: "shield-outline",

    keywords: ["insurance", "protection", "security"],
  },
  {
    name: "shield-check",

    keywords: ["insurance", "protected", "verified"],
  },
  {
    name: "shield-crown",

    keywords: ["premium", "insurance", "protection"],
  },
  {
    name: "lock",

    keywords: ["security", "secure", "protected"],
  },
  {
    name: "lock-outline",

    keywords: ["security", "secure", "protected"],
  },

  // Personal Care
  {
    name: "human-male-female",

    keywords: ["people", "person", "user"],
  },
  {
    name: "account",

    keywords: ["user", "profile", "person"],
  },
  {
    name: "account-group",

    keywords: ["family", "people", "users"],
  },
  {
    name: "baby",

    keywords: ["child", "infant", "family"],
  },
  {
    name: "paw",

    keywords: ["pet", "animal", "dog", "cat"],
  },
  {
    name: "cat",

    keywords: ["pet", "animal", "kitten"],
  },
  {
    name: "dog",

    keywords: ["pet", "animal", "puppy"],
  },
  {
    name: "face-man",

    keywords: ["person", "male", "user"],
  },
  {
    name: "face-woman",

    keywords: ["person", "female", "user"],
  },

  // Tools & Maintenance
  {
    name: "tools",

    keywords: ["repair", "fix", "maintenance"],
  },
  {
    name: "toolbox",

    keywords: ["repair", "tools", "maintenance"],
  },
  {
    name: "wrench",

    keywords: ["tool", "repair", "fix"],
  },
  {
    name: "hammer",

    keywords: ["tool", "repair", "build"],
  },
  {
    name: "screwdriver",

    keywords: ["tool", "repair", "fix"],
  },
  {
    name: "cog",

    keywords: ["settings", "configuration", "gear"],
  },

  // Nature & Environment
  {
    name: "tree",

    keywords: ["nature", "environment", "plant"],
  },
  {
    name: "flower",

    keywords: ["nature", "garden", "plant"],
  },
  {
    name: "leaf",

    keywords: ["nature", "environment", "eco"],
  },
  {
    name: "weather-sunny",

    keywords: ["sun", "weather", "bright"],
  },
  {
    name: "weather-cloudy",

    keywords: ["cloud", "weather", "sky"],
  },
  {
    name: "weather-rainy",

    keywords: ["rain", "weather", "water"],
  },
  {
    name: "weather-snowy",

    keywords: ["snow", "weather", "cold"],
  },

  // Miscellaneous
  {
    name: "star",

    keywords: ["favorite", "rating", "special"],
  },
  {
    name: "star-outline",

    keywords: ["favorite", "rating", "special"],
  },
  {
    name: "flag",

    keywords: ["marker", "important", "bookmark"],
  },
  {
    name: "flag-outline",

    keywords: ["marker", "important", "bookmark"],
  },
  {
    name: "bell",

    keywords: ["notification", "alert", "reminder"],
  },
  {
    name: "bell-outline",

    keywords: ["notification", "alert", "reminder"],
  },
  {
    name: "help-circle",

    keywords: ["question", "help", "info"],
  },
  {
    name: "help-circle-outline",

    keywords: ["question", "help", "info"],
  },
  {
    name: "information",

    keywords: ["info", "details", "help"],
  },
  {
    name: "information-outline",

    keywords: ["info", "details", "help"],
  },
  {
    name: "alert-circle",

    keywords: ["warning", "alert", "attention"],
  },
  {
    name: "alert-circle-outline",

    keywords: ["warning", "alert", "attention"],
  },
  {
    name: "check-circle",

    keywords: ["success", "done", "complete"],
  },
  {
    name: "check-circle-outline",

    keywords: ["success", "done", "complete"],
  },
  {
    name: "close-circle",

    keywords: ["cancel", "close", "remove"],
  },
  {
    name: "close-circle-outline",

    keywords: ["cancel", "close", "remove"],
  },
  {
    name: "plus-circle",

    keywords: ["add", "new", "create"],
  },
  {
    name: "plus-circle-outline",

    keywords: ["add", "new", "create"],
  },
  {
    name: "minus-circle",

    keywords: ["remove", "delete", "subtract"],
  },
  {
    name: "minus-circle-outline",

    keywords: ["remove", "delete", "subtract"],
  },
  {
    name: "dots-horizontal",

    keywords: ["menu", "more", "options"],
  },
  {
    name: "dots-vertical",

    keywords: ["menu", "more", "options"],
  },
  // Financial Services & Banking
  // {
  //   name: "paypal",
  //
  //   keywords: ["payment", "banking", "finance"],
  // },
  {
    name: "apple",

    keywords: ["apple-pay", "payment", "tech"],
  },
  {
    name: "google",

    keywords: ["google-pay", "payment", "tech"],
  },
  {
    name: "microsoft",

    keywords: ["tech", "software", "cloud"],
  },
  // {
  //   name: "amazon",
  //
  //   keywords: ["shopping", "ecommerce", "retail"],
  // },
  // {
  //   name: "stripe",
  //
  //   keywords: ["payment", "finance", "processing"],
  // },
  {
    name: "bitcoin",

    keywords: ["crypto", "cryptocurrency", "digital"],
  },
  {
    name: "ethereum",

    keywords: ["crypto", "cryptocurrency", "blockchain"],
  },

  // Retail & Shopping
  {
    name: "target",

    keywords: ["retail", "shopping", "store"],
  },
  // {
  //   name: "walmart",
  //
  //   keywords: ["retail", "shopping", "store"],
  // },
  // {
  //   name: "costco",
  //
  //   keywords: ["retail", "warehouse", "shopping"],
  // },
  // {
  //   name: "ikea",
  //
  //   keywords: ["furniture", "home", "retail"],
  // },
  // {
  //   name: "ebay",
  //
  //   keywords: ["marketplace", "shopping", "auction"],
  // },
  // {
  //   name: "etsy",
  //
  //   keywords: ["handmade", "craft", "marketplace"],
  // },
  // {
  //   name: "aliexpress",
  //
  //   keywords: ["shopping", "ecommerce", "retail"],
  // },

  // Food Delivery & Dining
  // {
  //   name: "uber",
  //
  //   keywords: ["ride", "transport", "delivery"],
  // },
  // {
  //   name: "lyft",
  //
  //   keywords: ["ride", "transport", "taxi"],
  // },
  // {
  //   name: "doordash",
  //
  //   keywords: ["food", "delivery", "restaurant"],
  // },
  // {
  //   name: "grubhub",
  //
  //   keywords: ["food", "delivery", "restaurant"],
  // },
  // {
  //   name: "ubereats",
  //
  //   keywords: ["food", "delivery", "restaurant"],
  // },
  // {
  //   name: "deliveroo",
  //
  //   keywords: ["food", "delivery", "restaurant"],
  // },
  // {
  //   name: "mcdonalds",
  //
  //   keywords: ["food", "fast-food", "restaurant"],
  // },
  // {
  //   name: "starbucks",
  //
  //   keywords: ["coffee", "cafe", "beverage"],
  // },
  {
    name: "subway",

    keywords: ["food", "fast-food", "sandwich"],
  },
  // {
  //   name: "dominos",
  //
  //   keywords: ["pizza", "food", "delivery"],
  // },
  // {
  //   name: "pizzahut",
  //
  //   keywords: ["pizza", "food", "restaurant"],
  // },
  // {
  //   name: "burgerking",
  //
  //   keywords: ["food", "fast-food", "burger"],
  // },
  // {
  //   name: "kfc",
  //
  //   keywords: ["food", "fast-food", "chicken"],
  // },

  // Streaming & Entertainment
  {
    name: "netflix",

    keywords: ["streaming", "video", "entertainment"],
  },
  {
    name: "spotify",

    keywords: ["music", "streaming", "audio"],
  },
  {
    name: "youtube",

    keywords: ["video", "streaming", "entertainment"],
  },
  {
    name: "hulu",

    keywords: ["streaming", "video", "entertainment"],
  },
  // {
  //   name: "disney",
  //
  //   keywords: ["streaming", "entertainment", "movies"],
  // },
  // {
  //   name: "hbo",
  //
  //   keywords: ["streaming", "video", "entertainment"],
  // },
  // {
  //   name: "prime-video",
  //
  //   keywords: ["streaming", "video", "amazon"],
  // },
  {
    name: "twitch",

    keywords: ["streaming", "gaming", "live"],
  },
  {
    name: "soundcloud",

    keywords: ["music", "audio", "streaming"],
  },
  // {
  //   name: "apple-music",
  //
  //   keywords: ["music", "streaming", "audio"],
  // },
  // {
  //   name: "tidal",
  //
  //   keywords: ["music", "streaming", "audio"],
  // },
  {
    name: "pandora",

    keywords: ["music", "radio", "streaming"],
  },

  // Gaming
  {
    name: "steam",

    keywords: ["gaming", "games", "platform"],
  },
  // {
  //   name: "playstation",
  //
  //   keywords: ["gaming", "console", "sony"],
  // },
  // {
  //   name: "xbox",
  //
  //   keywords: ["gaming", "console", "microsoft"],
  // },
  // {
  //   name: "nintendo",
  //
  //   keywords: ["gaming", "console", "switch"],
  // },
  // {
  //   name: "epicgames",
  //
  //   keywords: ["gaming", "games", "fortnite"],
  // },
  {
    name: "origin",

    keywords: ["gaming", "ea", "games"],
  },
  // {
  //   name: "battlenet",
  //
  //   keywords: ["gaming", "blizzard", "games"],
  // },

  // Social Media
  {
    name: "facebook",

    keywords: ["social", "media", "network"],
  },
  {
    name: "instagram",

    keywords: ["social", "media", "photos"],
  },
  {
    name: "twitter",

    keywords: ["social", "media", "network"],
  },
  {
    name: "linkedin",

    keywords: ["professional", "network", "business"],
  },
  {
    name: "reddit",

    keywords: ["social", "forum", "community"],
  },
  // {
  //   name: "tiktok",
  //
  //   keywords: ["social", "video", "entertainment"],
  // },
  {
    name: "snapchat",

    keywords: ["social", "messaging", "media"],
  },
  {
    name: "pinterest",

    keywords: ["social", "images", "inspiration"],
  },
  // {
  //   name: "discord",
  //
  //   keywords: ["chat", "gaming", "community"],
  // },
  // {
  //   name: "telegram",
  //
  //   keywords: ["messaging", "chat", "communication"],
  // },
  {
    name: "whatsapp",

    keywords: ["messaging", "chat", "communication"],
  },
  {
    name: "slack",

    keywords: ["work", "communication", "business"],
  },

  // Cloud & Storage
  {
    name: "dropbox",

    keywords: ["cloud", "storage", "files"],
  },
  {
    name: "google-drive",

    keywords: ["cloud", "storage", "google"],
  },
  // {
  //   name: "onedrive",
  //
  //   keywords: ["cloud", "storage", "microsoft"],
  // },
  {
    name: "apple-icloud",

    keywords: ["cloud", "storage", "apple"],
  },

  // Utilities & Services
  // {
  //   name: "att",
  //
  //   keywords: ["telecom", "phone", "mobile"],
  // },
  // {
  //   name: "verizon",
  //
  //   keywords: ["telecom", "phone", "mobile"],
  // },
  // {
  //   name: "tmobile",
  //
  //   keywords: ["telecom", "phone", "mobile"],
  // },
  // {
  //   name: "comcast",
  //
  //   keywords: ["internet", "cable", "telecom"],
  // },
  // {
  //   name: "spectrum",
  //
  //   keywords: ["internet", "cable", "telecom"],
  // },

  // Travel
  // {
  //   name: "airbnb",
  //
  //   keywords: ["travel", "accommodation", "lodging"],
  // },
  // {
  //   name: "booking",
  //
  //   keywords: ["travel", "hotel", "accommodation"],
  // },
  // {
  //   name: "expedia",
  //
  //   keywords: ["travel", "booking", "vacation"],
  // },
  // {
  //   name: "tripadvisor",
  //
  //   keywords: ["travel", "reviews", "hotel"],
  // },
  // {
  //   name: "southwest",
  //
  //   keywords: ["airline", "travel", "flight"],
  // },
  {
    name: "delta",

    keywords: ["airline", "travel", "flight"],
  },
  // {
  //   name: "united",
  //
  //   keywords: ["airline", "travel", "flight"],
  // },
  // {
  //   name: "american-airlines",
  //
  //   keywords: ["airline", "travel", "flight"],
  // },

  // Fitness & Health
  // {
  //   name: "fitbit",
  //
  //   keywords: ["fitness", "health", "tracker"],
  // },
  // {
  //   name: "peloton",
  //
  //   keywords: ["fitness", "exercise", "workout"],
  // },
  // {
  //   name: "strava",
  //
  //   keywords: ["fitness", "running", "cycling"],
  // },
  // {
  //   name: "myfitnesspal",
  //
  //   keywords: ["fitness", "health", "nutrition"],
  // },

  // Education
  // {
  //   name: "udemy",
  //
  //   keywords: ["education", "learning", "courses"],
  // },
  // {
  //   name: "coursera",
  //
  //   keywords: ["education", "learning", "courses"],
  // },
  // {
  //   name: "skillshare",
  //
  //   keywords: ["education", "learning", "creative"],
  // },
  // {
  //   name: "duolingo",
  //
  //   keywords: ["education", "language", "learning"],
  // },

  // News & Media
  // {
  //   name: "medium",
  //
  //   keywords: ["writing", "blog", "content"],
  // },
  // {
  //   name: "wordpress",
  //
  //   keywords: ["blog", "website", "cms"],
  // },
  // {
  //   name: "nytimes",
  //
  //   keywords: ["news", "media", "journalism"],
  // },
  // {
  //   name: "wsj",
  //
  //   keywords: ["news", "business", "finance"],
  // },
]
