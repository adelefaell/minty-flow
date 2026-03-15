import { useTranslation } from "react-i18next"

import { ConfirmModal } from "~/components/confirm-modal"
import type { TranslationKey } from "~/i18n/config"
import type { Goal } from "~/types/goals"

interface GoalFormModalsProps {
  deleteModalVisible: boolean
  archiveModalVisible: boolean
  unsavedModalVisible: boolean
  isAddMode: boolean
  goal?: Goal
  onCloseDeleteModal: () => void
  onCloseArchiveModal: () => void
  onCloseUnsavedModal: () => void
  onConfirmDelete: () => void
  onConfirmArchive: () => void
  onDiscardAndNavigate: () => void
}

export function GoalFormModals({
  deleteModalVisible,
  archiveModalVisible,
  unsavedModalVisible,
  isAddMode,
  goal,
  onCloseDeleteModal,
  onCloseArchiveModal,
  onCloseUnsavedModal,
  onConfirmDelete,
  onConfirmArchive,
  onDiscardAndNavigate,
}: GoalFormModalsProps) {
  const { t } = useTranslation()

  const isArchived = goal?.isArchived ?? false

  return (
    <>
      {!isAddMode && goal && (
        <ConfirmModal
          visible={deleteModalVisible}
          onRequestClose={onCloseDeleteModal}
          onConfirm={onConfirmDelete}
          title={t("common.modals.deletePermanently")}
          description={goal.name}
          confirmLabel={t("common.actions.delete")}
          cancelLabel={t("common.actions.cancel")}
          variant="destructive"
          icon="trash"
        />
      )}

      {!isAddMode && goal && (
        <ConfirmModal
          visible={archiveModalVisible}
          onRequestClose={onCloseArchiveModal}
          onConfirm={onConfirmArchive}
          title={
            isArchived
              ? t(
                  "screens.settings.goals.form.archiveModal.unarchiveTitle" as TranslationKey,
                )
              : t(
                  "screens.settings.goals.form.archiveModal.archiveTitle" as TranslationKey,
                )
          }
          description={goal.name}
          confirmLabel={
            isArchived
              ? t(
                  "screens.settings.goals.form.archiveModal.unarchiveConfirm" as TranslationKey,
                )
              : t(
                  "screens.settings.goals.form.archiveModal.archiveConfirm" as TranslationKey,
                )
          }
          cancelLabel={t("common.actions.cancel")}
          variant="default"
          icon={isArchived ? "archive-off" : "archive"}
        />
      )}

      <ConfirmModal
        visible={unsavedModalVisible}
        onRequestClose={onCloseUnsavedModal}
        onConfirm={onDiscardAndNavigate}
        title={t("common.modals.closeWithoutSaving")}
        description={t("common.modals.unsavedDescription")}
        confirmLabel={t("common.actions.discard")}
        cancelLabel={t("common.actions.cancel")}
        variant="default"
      />
    </>
  )
}
