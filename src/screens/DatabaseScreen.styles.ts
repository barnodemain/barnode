import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  modalText: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  modalButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(45, 90, 61, 0.4)',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtonPrimary: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8F6F0',
  },
  listItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 90, 61, 0.1)',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
  },
  fornitorDetails: {
    gap: 2,
  },
  itemDetail: {
    fontSize: 13,
  },
  articoliSection: {
    gap: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.sm,
  },
  articoliScroll: {
    flex: 1,
  },
});
