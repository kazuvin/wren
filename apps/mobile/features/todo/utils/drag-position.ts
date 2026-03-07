/**
 * ドラッグ中のリアルタイム並び替えに必要な位置計算ユーティリティ
 */

/**
 * ドラッグの移動量から移動先の index を計算する（clamp 付き）
 */
export function calculateTargetIndex(
	originalIndex: number,
	translateY: number,
	itemStep: number,
	totalCount: number,
): number {
	"worklet";
	const movedPositions = Math.round(translateY / itemStep);
	return Math.max(0, Math.min(totalCount - 1, originalIndex + movedPositions));
}

/**
 * 非ドラッグアイテムのオフセットを計算する
 *
 * ドラッグアイテムが originalIndex → currentIndex に移動した際、
 * その間にあるアイテムを ±itemStep ずらす。
 */
export function calculateItemOffset(
	itemIndex: number,
	draggedOriginalIndex: number,
	draggedCurrentIndex: number,
	itemStep: number,
): number {
	"worklet";
	// ドラッグ中のアイテム自身は offset 0
	if (itemIndex === draggedOriginalIndex) {
		return 0;
	}

	// 下方向ドラッグ: originalIndex < currentIndex
	if (draggedOriginalIndex < draggedCurrentIndex) {
		if (itemIndex > draggedOriginalIndex && itemIndex <= draggedCurrentIndex) {
			return -itemStep;
		}
	}

	// 上方向ドラッグ: originalIndex > currentIndex
	if (draggedOriginalIndex > draggedCurrentIndex) {
		if (itemIndex >= draggedCurrentIndex && itemIndex < draggedOriginalIndex) {
			return itemStep;
		}
	}

	return 0;
}
