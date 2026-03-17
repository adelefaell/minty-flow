import type { FC } from "react"
import type { OpaqueColorValue, StyleProp, ViewStyle } from "react-native"
import type { SvgProps } from "react-native-svg"
import { useUnistyles } from "react-native-unistyles"

import * as FilledIcons from "~/components/icons/filled"
import * as OutlineIcons from "~/components/icons/outline"
import { logger } from "~/utils/logger"

const ICON_MAP = {
  // UI & Navigation
  "arrow-down-left": OutlineIcons.ArrowDownLeft,
  "arrow-narrow-left": OutlineIcons.ArrowNarrowLeft,
  "arrow-narrow-right": OutlineIcons.ArrowNarrowRight,
  "arrow-up-right": OutlineIcons.ArrowUpRight,
  "arrow-narrow-up": OutlineIcons.ArrowNarrowUp,
  "arrow-narrow-down": OutlineIcons.ArrowNarrowDown,
  "arrow-down": OutlineIcons.ArrowDown,
  "arrow-up": OutlineIcons.ArrowUp,
  "arrow-up-circle": FilledIcons.ArrowUpCircle,
  "arrow-down-circle": FilledIcons.ArrowDownCircle,
  "chevron-down": FilledIcons.ChevronDown,
  "chevron-up": OutlineIcons.ChevronUp,
  "chevron-left": OutlineIcons.ChevronLeft,
  "chevron-right": FilledIcons.ChevronRight,
  "chevrons-down": OutlineIcons.ChevronsDown,
  "chevrons-up": OutlineIcons.ChevronsUp,
  transfer: OutlineIcons.Transfer,
  x: FilledIcons.X,
  search: OutlineIcons.Search,
  "arrows-up-down": OutlineIcons.ArrowsUpDown,
  "arrows-left-right": OutlineIcons.ArrowsLeftRight,
  eye: FilledIcons.Eye,
  "eye-off": OutlineIcons.EyeOff,

  // Status & Alerts
  "alert-triangle": FilledIcons.AlertTriangle,
  "alert-circle": FilledIcons.AlertCircle,
  check: FilledIcons.Check,
  checks: OutlineIcons.Checks,
  "info-circle": FilledIcons.InfoCircle,
  "shield-exclamation": OutlineIcons.ShieldExclamation,

  // Shapes & Layout
  circle: FilledIcons.Circle,
  "circle-dot": FilledIcons.CircleDot,
  category: OutlineIcons.Category,
  "category-2": OutlineIcons.Category2,
  "category-plus": OutlineIcons.CategoryPlus,
  triangle: FilledIcons.Triangle,
  "chart-bar": OutlineIcons.ChartBar,
  "chart-area-line": FilledIcons.ChartAreaLine,
  "chart-pie": FilledIcons.ChartPie,
  "chart-dots": FilledIcons.ChartDots,
  "chart-histogram": OutlineIcons.ChartHistogram,
  "page-break": OutlineIcons.PageBreak,
  "list-details": FilledIcons.ListDetails,

  // Food & Drink
  pizza: FilledIcons.Pizza,
  headphones: FilledIcons.Headphones,

  // Media & Visual
  camera: FilledIcons.Camera,
  photo: FilledIcons.Photo,
  "library-photo": OutlineIcons.LibraryPhoto,

  // File types
  file: FilledIcons.File,
  files: FilledIcons.Files,
  "file-description": FilledIcons.FileDescription,
  "file-type-jpg": OutlineIcons.FileTypeJpg,
  video: FilledIcons.Video,
  "file-analytics": FilledIcons.FileAnalytics,
  presentation: FilledIcons.Presentation,
  palette: FilledIcons.Palette,
  "color-swatch": OutlineIcons.ColorSwatch,
  "file-zip": OutlineIcons.FileZip,
  "file-type-pdf": OutlineIcons.FileTypePdf,

  // Text & Editing
  clipboard: FilledIcons.Clipboard,
  pencil: FilledIcons.Pencil,
  eraser: OutlineIcons.Eraser,
  puzzle: FilledIcons.Puzzle,
  paperclip: OutlineIcons.Paperclip,
  language: OutlineIcons.Language,

  // Math & Calculator
  calculator: FilledIcons.Calculator,
  plus: FilledIcons.Plus,
  minus: OutlineIcons.Minus,
  percentage: OutlineIcons.Percentage,
  divide: OutlineIcons.Divide,
  equal: OutlineIcons.Equal,
  "plus-minus": OutlineIcons.PlusMinus,
  "circle-plus": FilledIcons.CirclePlus,

  // Finance & Commerce
  briefcase: FilledIcons.Briefcase,
  wallet: OutlineIcons.Wallet,
  "credit-card": FilledIcons.CreditCard,
  "currency-dollar": OutlineIcons.CurrencyDollar,
  currency: OutlineIcons.Currency,
  "cash-banknote": FilledIcons.CashBanknote,
  "pig-money": OutlineIcons.PigMoney,
  pig: FilledIcons.Pig,
  tag: FilledIcons.Tag,
  tags: FilledIcons.Tags,
  "tag-plus": OutlineIcons.TagPlus,
  "coin-pound": FilledIcons.CoinPound,
  "shopping-cart": FilledIcons.ShoppingCart,
  gift: FilledIcons.Gift,
  basket: FilledIcons.Basket,
  "cash-banknote-plus": OutlineIcons.CashBanknotePlus,
  "building-bank": OutlineIcons.BuildingBank,

  // Devices & System
  database: FilledIcons.Database,
  dialpad: FilledIcons.Dialpad,
  "device-desktop": FilledIcons.DeviceDesktop,
  settings: FilledIcons.Settings,
  "device-mobile-vibration": OutlineIcons.DeviceMobileVibration,
  "device-mobile-off": OutlineIcons.DeviceMobileOff,
  "device-mobile": FilledIcons.DeviceMobile,
  refresh: OutlineIcons.Refresh,
  restore: OutlineIcons.Restore,

  // Security
  lock: FilledIcons.Lock,
  "lock-open": OutlineIcons.LockOpen,
  fingerprint: OutlineIcons.Fingerprint,
  "password-mobile-phone": OutlineIcons.PasswordMobilePhone,

  // People & Social
  "heart-handshake": OutlineIcons.HeartHandshake,
  heart: FilledIcons.Heart,
  activity: OutlineIcons.Activity,
  "device-heart-monitor": FilledIcons.DeviceHeartMonitor,
  user: FilledIcons.User,

  // Places
  "map-pin": FilledIcons.MapPin,
  "world-pin": OutlineIcons.WorldPin,
  "current-location": FilledIcons.CurrentLocation,
  building: OutlineIcons.Building,
  "building-bridge-2": FilledIcons.BuildingBridge2,
  school: FilledIcons.School,
  car: FilledIcons.Car,
  map: OutlineIcons.Map,

  // Misc
  backspace: FilledIcons.Backspace,
  bell: FilledIcons.Bell,
  trash: FilledIcons.Trash,
  target: OutlineIcons.Target,
  clock: FilledIcons.Clock,
  "clock-bolt": OutlineIcons.ClockBolt,
  calendar: FilledIcons.Calendar,
  "calendar-repeat": OutlineIcons.CalendarRepeat,
  "calendar-event": FilledIcons.CalendarEvent,
  "calendar-week": FilledIcons.CalendarWeek,
  "calendar-month": FilledIcons.CalendarMonth,
  "clock-hour-4": FilledIcons.ClockHour4,
  anchor: OutlineIcons.Anchor,
  archive: FilledIcons.Archive,
  "archive-off": OutlineIcons.ArchiveOff,
  star: FilledIcons.Star,
  "trending-up": OutlineIcons.TrendingUp,
  "trending-down": OutlineIcons.TrendingDown,
  filter: FilledIcons.Filter,
  "filter-off": OutlineIcons.FilterOff,
  "external-link": FilledIcons.ExternalLink,
  asterisk: OutlineIcons.Asterisk,
  "square-asterisk": FilledIcons.SquareAsterisk,
  adjustments: FilledIcons.Adjustments,
  circles: FilledIcons.Circles,
  "trash-off": OutlineIcons.TrashOff,
  repeat: OutlineIcons.Repeat,
  "playlist-x": OutlineIcons.PlaylistX,
  affiliate: OutlineIcons.Affiliate,
  hash: OutlineIcons.Hash,
  "grip-horizontal": OutlineIcons.GripHorizontal,
  "question-mark": OutlineIcons.QuestionMark,
  "arrow-move-vertical": OutlineIcons.ArrowsMoveVertical,
  "alert-square-rounded": OutlineIcons.AlertSquareRounded,
  "address-book": OutlineIcons.AddressBook,
  "switch-horizontal": OutlineIcons.SwitchHorizontal,
  "arrows-diff": OutlineIcons.ArrowsDiff,
  "home-share": OutlineIcons.HomeShare,
  scale: OutlineIcons.Scale,
  "caret-down": FilledIcons.CaretDown,
  "caret-up": FilledIcons.CaretUp,
  //TODO: this clock progress like
  "history-toggle": OutlineIcons.HistoryToggle,
  copy: FilledIcons.Copy,
  receipt: OutlineIcons.Receipt,
} as const satisfies Record<string, FC<SvgProps>>

export type IconSvgName = keyof typeof ICON_MAP

export type IconSize =
  | 12
  | 14
  | 16
  | 18
  | 20
  | 22
  | 24
  | 28
  | 32
  | 36
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 88
  | 96
  | 104
  | 112
  | 120
  | 128
  | 136
  | 144
  | 152
  | 160
  | 168
  | 176
  | 184
  | 192
  | 200
  | 208
  | 216
  | 224
  | 232
  | 240
  | 248
  | 256
  | 26

type IconSymbolProps = Omit<SvgProps, "width" | "height"> & {
  name: IconSvgName
  size?: IconSize
  color?: string | OpaqueColorValue
  style?: StyleProp<ViewStyle>
}

export function IconSvg({
  name,
  size = 24,
  color,
  style,
  ...rest
}: IconSymbolProps) {
  const { theme } = useUnistyles()

  let Icon = ICON_MAP[name] ?? ICON_MAP["question-mark"]

  if (!Icon) {
    if (__DEV__) logger.warn(`IconSvg: unknown icon "${name}"`)
    Icon = ICON_MAP["question-mark"]
  }

  const ResolvedIcon = Icon as FC<SvgProps>

  const resolvedColor = color || theme.colors.primary

  return (
    <ResolvedIcon
      width={size}
      height={size}
      color={resolvedColor}
      style={style as SvgProps["style"]}
      {...rest}
    />
  )
}
