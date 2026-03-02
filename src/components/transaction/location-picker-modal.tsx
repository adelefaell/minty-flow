import * as Location from "expo-location"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ActivityIndicator, Modal, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  StyleSheet as UnistylesSheet,
  useUnistyles,
} from "react-native-unistyles"
import { WebView, type WebViewMessageEvent } from "react-native-webview"

import { Pressable } from "~/components/ui/pressable"
import { Text } from "~/components/ui/text"
import { View } from "~/components/ui/view"
import type { TransactionLocation } from "~/types/transactions"

interface LocationPickerModalProps {
  visible: boolean
  initialLocation?: TransactionLocation | null
  onConfirm: (location: TransactionLocation) => void
  onRequestClose: () => void
}

/** Generates self-contained Leaflet HTML with a draggable/tappable pin. */
function buildLeafletHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { width:100%; height:100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    let marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

    function emit(latlng) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'pin_moved', lat: latlng.lat, lng: latlng.lng })
      );
    }

    marker.on('dragend', () => emit(marker.getLatLng()));

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      emit(e.latlng);
    });

    // Receive 'reset_pin' from React Native
    function onRNMessage(raw) {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'reset_pin') {
          marker.setLatLng([msg.lat, msg.lng]);
          map.setView([msg.lat, msg.lng], 15);
        }
      } catch (_) {}
    }
    document.addEventListener('message', (e) => onRNMessage(e.data));
    window.addEventListener('message', (e) => onRNMessage(e.data));
  </script>
</body>
</html>`
}

function LocationPickerContent({
  initialLocation,
  onConfirm,
  onRequestClose,
}: Omit<LocationPickerModalProps, "visible">) {
  const { t } = useTranslation()
  const { theme } = useUnistyles()
  const insets = useSafeAreaInsets()

  const webviewRef = useRef<WebView>(null)
  const [mapHtml, setMapHtml] = useState<string | null>(null)
  const [coords, setCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      // Resolve current GPS location for the "reset" button
      let gpsLat = 37.7749
      let gpsLng = -122.4194
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        gpsLat = pos.coords.latitude
        gpsLng = pos.coords.longitude
      } catch {
        // Silently use fallback
      }

      if (cancelled) return

      setGpsCoords({ latitude: gpsLat, longitude: gpsLng })

      // Initial pin: prefer existing location, fall back to GPS
      const initLat = initialLocation?.latitude ?? gpsLat
      const initLng = initialLocation?.longitude ?? gpsLng

      setCoords({ latitude: initLat, longitude: initLng })
      setMapHtml(buildLeafletHtml(initLat, initLng))
    }

    init()
    return () => {
      cancelled = true
    }
  }, [initialLocation])

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string
        lat: number
        lng: number
      }
      if (data.type === "pin_moved") {
        setCoords({ latitude: data.lat, longitude: data.lng })
      }
    } catch {
      // ignore malformed messages
    }
  }, [])

  const handleResetToGps = useCallback(() => {
    if (!gpsCoords) return
    setCoords(gpsCoords)
    webviewRef.current?.postMessage(
      JSON.stringify({
        type: "reset_pin",
        lat: gpsCoords.latitude,
        lng: gpsCoords.longitude,
      }),
    )
  }, [gpsCoords])

  const handleConfirm = useCallback(() => {
    if (!coords) return
    onConfirm({ latitude: coords.latitude, longitude: coords.longitude })
  }, [onConfirm, coords])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            backgroundColor: theme.colors.surface,
            borderBottomColor: `${theme.colors.customColors.semi}30`,
          },
        ]}
      >
        <Pressable
          onPress={onRequestClose}
          hitSlop={12}
          style={styles.headerSideBtn}
        >
          <Text style={[styles.cancelText, { color: theme.colors.onSurface }]}>
            {t("common.actions.cancel")}
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t("components.locationPicker.title")}
        </Text>
        <Pressable
          onPress={handleConfirm}
          hitSlop={12}
          style={[styles.headerSideBtn, styles.confirmBtn]}
          disabled={!coords}
        >
          <Text
            style={[
              styles.confirmText,
              {
                color: coords
                  ? theme.colors.primary
                  : theme.colors.customColors.semi,
              },
            ]}
          >
            {t("common.actions.confirm")}
          </Text>
        </Pressable>
      </View>

      {/* Map */}
      {!mapHtml ? (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ActivityIndicator color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.customColors.semi },
            ]}
          >
            {t("components.locationPicker.gettingLocation")}
          </Text>
        </View>
      ) : (
        <WebView
          ref={webviewRef}
          style={styles.map}
          source={{ html: mapHtml }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
        />
      )}

      {/* Footer: coordinates + reset button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: `${theme.colors.customColors.semi}30`,
            paddingBottom: Math.max(insets.bottom, 20),
          },
        ]}
      >
        <Text
          style={[styles.coordsText, { color: theme.colors.customColors.semi }]}
          numberOfLines={1}
        >
          {coords
            ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
            : t("components.locationPicker.tapOrDrag")}
        </Text>
        {gpsCoords && (
          <Pressable
            onPress={handleResetToGps}
            hitSlop={8}
            style={[
              styles.myLocationBtn,
              { borderColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[styles.myLocationText, { color: theme.colors.primary }]}
            >
              {t("components.locationPicker.myLocation")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export function LocationPickerModal({
  visible,
  initialLocation,
  onConfirm,
  onRequestClose,
}: LocationPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onRequestClose}
    >
      {visible ? (
        <LocationPickerContent
          initialLocation={initialLocation}
          onConfirm={onConfirm}
          onRequestClose={onRequestClose}
        />
      ) : null}
    </Modal>
  )
}

const styles = UnistylesSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerSideBtn: {
    minWidth: 72,
  },
  confirmBtn: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 17,
  },
  confirmText: {
    fontSize: 17,
    fontWeight: "600",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1,
    minHeight: 70,
  },
  coordsText: {
    flex: 1,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  myLocationBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  myLocationText: {
    fontSize: 13,
    fontWeight: "600",
  },
})
