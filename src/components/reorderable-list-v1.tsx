import { useCallback, useEffect, useState } from "react"
import { FlatList, type FlatListProps, type ListRenderItem } from "react-native"
import {
  Gesture,
  GestureDetector,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"

import { View } from "~/components/ui/view"

const AnimatedView = Animated.createAnimatedComponent(View)

interface ReorderableListV1Props<T>
  extends Omit<FlatListProps<T>, "renderItem"> {
  data: T[]
  onReorder: (newData: T[]) => void
  renderItem: ListRenderItem<T>
  itemHeight?: number
  longPressDelay?: number
  reorderEnabled?: boolean
}

interface ReorderableItemV1Props<T> {
  item: T
  index: number
  renderItem: ListRenderItem<T>
  itemHeight: number
  dataLength: number
  onReorder: (fromIndex: number, toIndex: number) => void
  onDragStart: (index: number) => void
  onDragEnd: () => void
  longPressDelay: number
  isDragging: boolean
  onItemLayout?: (height: number) => void
  isMeasuring?: boolean
  reorderEnabled: boolean
}

function ReorderableItemV1<T>({
  item,
  index,
  renderItem,
  itemHeight,
  dataLength,
  onReorder,
  onDragStart,
  onDragEnd,
  longPressDelay,
  isDragging,
  onItemLayout,
  isMeasuring = false,
  reorderEnabled,
}: ReorderableItemV1Props<T>) {
  const translateY = useSharedValue(0)
  const offsetY = useSharedValue(index * itemHeight)
  const currentIndex = useSharedValue(index)
  const isDraggingValue = useSharedValue(false)

  // Update base position when index changes (after reordering) but not while dragging
  useEffect(() => {
    if (!isDragging) {
      offsetY.value = withSpring(index * itemHeight, {
        damping: 20,
        stiffness: 90,
      })
      currentIndex.value = index
    }
  }, [index, isDragging, itemHeight, offsetY, currentIndex])

  // Measure the content height (before absolute positioning constraint)
  const handleContentLayout = useCallback(
    (event: { nativeEvent: { layout: { height: number } } }) => {
      const height = event.nativeEvent.layout.height
      if (onItemLayout && height > 0) {
        onItemLayout(height)
      }
    },
    [onItemLayout],
  )

  const panGesture = Gesture.Pan()
    .enabled(reorderEnabled)
    .activeOffsetY([-10, 10])
    .activateAfterLongPress(longPressDelay)
    .onStart(() => {
      "worklet"
      currentIndex.value = index
      isDraggingValue.value = true
      scheduleOnRN(onDragStart, index)
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      "worklet"
      translateY.value = event.translationY

      // Calculate target index based on current position
      const currentY = offsetY.value + event.translationY
      const newIndex = Math.max(
        0,
        Math.min(Math.round(currentY / itemHeight), dataLength - 1),
      )

      if (newIndex !== currentIndex.value) {
        const fromIndex = currentIndex.value
        scheduleOnRN(onReorder, fromIndex, newIndex)
        currentIndex.value = newIndex
      }
    })
    .onEnd(() => {
      "worklet"
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
    })
    .onFinalize(() => {
      "worklet"
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
      isDraggingValue.value = false
      scheduleOnRN(onDragEnd)
    })

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offsetY.value + translateY.value }],
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      height: itemHeight,
      zIndex: isDragging ? 1000 : 0,
      elevation: isDragging ? 10 : 0,
      opacity: isDragging ? 0.9 : 1,
    }
  })

  // Create separators object for renderItem
  const separators = {
    highlight: () => {},
    unhighlight: () => {},
    updateProps: (select: "leading" | "trailing", newProps: unknown) => {},
  }

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView style={animatedStyle}>
        {/* Measure the actual content height - only for first item if measuring */}
        <View
          onLayout={isMeasuring ? handleContentLayout : undefined}
          style={{ width: "100%", height: "100%" }}
        >
          {renderItem({ item, index, separators })}
        </View>
      </AnimatedView>
    </GestureDetector>
  )
}

export function ReorderableListV1<T extends { id: string } | string>({
  data,
  onReorder,
  renderItem,
  itemHeight = 60,
  longPressDelay = 500,
  reorderEnabled = true,
  ...flatListProps
}: ReorderableListV1Props<T>) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)

  // Reset measured height when itemHeight prop changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally reset when itemHeight changes
  useEffect(() => {
    setMeasuredHeight(null)
  }, [itemHeight])

  // Use measured height if available, otherwise fall back to prop
  const effectiveItemHeight = measuredHeight ?? itemHeight

  const getItemId = useCallback((item: T, index: number): string => {
    if (typeof item === "string") return item
    return item.id ?? index.toString()
  }, [])

  const reorderItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return

      const newData = [...data]
      const [moved] = newData.splice(fromIndex, 1)
      newData.splice(toIndex, 0, moved)
      onReorder(newData as T[])
    },
    [data, onReorder],
  )

  const handleDragStart = useCallback(
    (index: number) => {
      const item = data[index]
      if (item) {
        setDraggingId(getItemId(item, index))
      }
    },
    [data, getItemId],
  )

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
  }, [])

  const handleItemLayout = useCallback((height: number) => {
    setMeasuredHeight(height)
  }, [])

  // Provide getItemLayout to FlatList so it knows item positions
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: effectiveItemHeight,
      offset: effectiveItemHeight * index,
      index,
    }),
    [effectiveItemHeight],
  )

  const renderReorderableItemV1: ListRenderItem<T> = useCallback(
    (props) => {
      const itemId = getItemId(props.item, props.index)
      // Only measure the first item (index 0) and only if we haven't measured yet
      const shouldMeasure = props.index === 0 && measuredHeight === null
      return (
        <ReorderableItemV1
          {...props}
          renderItem={renderItem}
          itemHeight={effectiveItemHeight}
          dataLength={data.length}
          onReorder={reorderItems}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          longPressDelay={longPressDelay}
          isDragging={draggingId === itemId}
          onItemLayout={shouldMeasure ? handleItemLayout : undefined}
          isMeasuring={shouldMeasure}
          reorderEnabled={reorderEnabled}
        />
      )
    },
    [
      renderItem,
      effectiveItemHeight,
      data.length,
      reorderItems,
      handleDragStart,
      handleDragEnd,
      longPressDelay,
      draggingId,
      getItemId,
      handleItemLayout,
      measuredHeight,
      reorderEnabled,
    ],
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        {...flatListProps}
        data={data}
        renderItem={renderReorderableItemV1}
        keyExtractor={(item, index) => {
          if (typeof item === "string") return item
          return item.id ?? index.toString()
        }}
        getItemLayout={getItemLayout}
        scrollEnabled={reorderEnabled ? draggingId === null : true}
        removeClippedSubviews={false}
        contentContainerStyle={[
          {
            minHeight: data.length * effectiveItemHeight,
            position: "relative",
          },
          flatListProps.contentContainerStyle,
        ]}
      />
    </View>
  )
}
