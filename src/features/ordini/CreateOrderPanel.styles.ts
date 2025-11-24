import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownTrigger: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
  },
  helperText: {
    marginTop: Spacing.xs,
    fontSize: 13,
  },
  dropdownList: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  articlesSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  articlesTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  articlesList: {
    gap: Spacing.sm,
  },
});
